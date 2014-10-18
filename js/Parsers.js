window.MIDITools.Parsers.Binary = (function(MT) {
  'use strict';

  var MIN_HEADER_LENGTH = 14;
  var HEADER_PRELUDE = 'MThd';
  var TRACK_PRELUDE = 'MTrk';

  var importBinary = function(src, callback, error) {
    if (!src || !callback) {
      throw new Error('Both parameters required!');
    }

    DOMLoader.sendRequest({
      url: src,
      onload: function(req) {
        try {
          callback(fromBinary(toByteString(req.responseText)));
        } catch (err) {
          return error && error(err);
        }
      },
      onerror: function() {
        // TODO: replace with custom error type?
        throw new Error('Could not load file');
      }
    });
  };


  /*!
   * @param {Array} bytes - the byte array representing the binary file 
   * @return {MIDIFile} - the MIDIFile representation of the binary file
   */

  function fromBinary(bytes) {
    var m = new MT.MIDIFile(0);
    parseHeader(m, bytes);
    for (var i = 0, n = m.tracks.length; i < n; i += 1) {
      parseTrack(m.tracks[i], bytes);
    }
    return m;
  }


  /*!
   * @post m.type is set to either 0 or 1
   * @post m.ticksPerBeat is set to the appropriate value
   * @post m.trackCount set according to header's track count
   * @post m.tracks contains `m.trackCount` empty tracks
   */

  function parseHeader(m, bytes) {
    
    // Parsing the Header chunk
    // ------------------------
    // The format of the header is specified in the
    // [Binary format document](../ref/binary.html).    

    // sanity check: die for files that aren't big enough
    // to even declare a MIDI header
    if (bytes.length < MIN_HEADER_LENGTH) {
      throw MT.Errors.Format.FileSize;
    }

    // sanity check: Any MIDI file must begin with the `MTrk` constant.
    parseStringConstant(bytes, HEADER_PRELUDE, MT.Errors.Format.HeaderPrelude);
    var headerSize = parseHeaderSize(bytes);
    var midiType = parseType(bytes);
    var trackCount = parseInteger(bytes, 2);
    var ticksPerBeat = parseHeaderTPB(bytes);

    // sanity check: a Type-0 file that declares multiple tracks
    // is just asking for trouble; we fail appropriately
    if (midiType === 0 && trackCount !== 1) {
      throw MT.Errors.Format.Type0MultiTrack;
    }

    // Since the header contains globally-useful information,
    // we store the results in the `event` object itself, rather
    // than inside the `message` property
    m.type = midiType;
    m.trackCount = trackCount;
    m.ticksPerBeat = ticksPerBeat;


    // initialize an empty `track` object for each declared track
    for (var i = 0; i < trackCount; i += 1) {
      m.tracks.push({
        number: i,
        events: [],
        eventTypes: {}
      });
    }
  }


  /*!
   * Returns header's file size declaration,
   * if and only if it agrees with actual file size.
   * 
   * @throws MT.Errors.Format.HeaderSize if size declaration and
   *         file size do not agree
   */

  function parseHeaderSize(bytes) {
    var size = parseInteger(bytes, 4);
    if (bytes.length < size) {
      throw MT.Errors.Format.HeaderSize;
    } else {
      return size;
    }
  }


  /*!
   * Returns the MIDI file type,
   * if and only if the type is in {0, 1}.
   * 
   * @throws MT.Errors.Format.Type if the type is not 0 or 1
   */

  function parseType(bytes) {
    var type = parseInteger(bytes, 2);
    if (type !== 0 && type !== 1) {
      throw MT.Errors.Format.Type;
    } else {
      return type;
    }
  }


  /*!
   * TODO
   */

  function parseHeaderTPB(bytes) {
    // TODO: check type of TPB and parse appropriately
    return parseInteger(bytes, 2);
  }


  function parseTrack(track, bytes) {
    parseTrackHeader(track, bytes);
    parseTrackEvents(track, bytes);
  }


  function parseTrackHeader(track, bytes) {
    parseStringConstant(bytes, TRACK_PRELUDE, MT.Errors.Format.TrackPrelude);
    var size = parseInteger(bytes, 4);
    // TODO: check declared size vs final size after events parsed
    if (bytes.length < size) {
      throw MT.Errors.Format.TrackLength;
    } else {
      return size;
    }
  }
  

  function parseTrackEvents(track, bytes) {
    while (true) {      
      var evt = parseEvent(track, bytes);

      if (bytes.length === 0 || evt.message.type === 'endOfTrack') {
        break;
      }
    }
  }

  // MIDI Event / Message Parsing
  // ----------------------------

  var messageParsers = {
    'channel': parseChannelMessage,
    'meta': parseMetaMessage,
    'sysex': parseSysExMessage
  };

  function parseEvent(track, bytes) {
    var evt = {
      timestamp: parseVariableInteger(bytes),
      status: parseInteger(bytes, 1)
    };

    parseMessage(track, evt, bytes);
    track.events.push(evt);
    return evt;
  }

  function parseMessage(track, evt, bytes, checkedPrevious) {
    if (isMetaEvent(evt.status)) {
      evt.message = parseMetaMessage(evt.status, bytes);
    } else if ((evt.status === 0xF0 || evt.status === 0xF7)) {
      evt.message = parseSysExMessage(evt.status, bytes);
    } else if (isChannelEvent(evt.status)) {
      evt.message = parseChannelMessage(evt.status, bytes);
    } else if (!checkedPrevious) {
      evt.runningStatus = true;
      evt.status = track.events[track.events.length - 1].status;
      bytes.unshift(evt.status);
      parseMessage(track, evt, bytes, true);
    } else {
      throw new Error('Cannot find this message');
    }
  }

  function parseChannelMessage(status, bytes) {
    var type = (status & 0xF0) >> 4;
    var channel = (status & 0x0F) >> 4;
    var spec = MT.Data.binaryMap[type];
    var msg = {
      kind: spec.kind,
      type: spec.type,
      channel: channel,
      parameters: {}
    };

    var paramCount = 0;
    // todo: document that the parameters are available by name or index
    spec.parameters.forEach(function(name, index) {
      msg.parameters[name] = parseInteger(bytes, 1);
      msg.parameters[index] = msg.parameters[name];
    });

    return msg;
  }

  var valueParsers = {
    'string': parseString,
    'number': parseInteger
  };

  function parseMetaMessage(status, bytes) {
    var type = parseInteger(bytes, 1);
    var length = parseInteger(bytes, 1);
    var spec = MT.Data.binaryMap[type];
    // TODO: compare length and throw error
    var msg = {
      kind: spec.kind,
      length: length,
      type: spec.type
    };
    var cutLength = (spec.length === 'variable' ? length : spec.length);
    msg.parameters = bytes.slice(0, cutLength);
    for (var i = 0; i < cutLength; i += 1) {
      bytes.shift();
    }
    return msg;
  }

  function parseSysExMessage(status, bytes) {
    var length = parseVariableInteger(bytes);

    var msg = {
      kind: MT.Data.binaryMap[status].kind,
      length: length,
      type: 'unknown' // TODO: FIX
    };

    msg.parameters = bytes.slice(0, length);
    for (var i = 0; i < length; i += 1) {
      bytes.shift();
    }
    return msg;
  }

  function isChannelEvent(status) {
    var type = ((status & 0xF0) >> 4);
    return (0x8 <= type && type <= 0xE);
  }

  function isMetaEvent(status) {
    return (status === 0xFF);
  }

  function isSysExEvent(status) {
    return (status === 0xF0 || status === 0xF7);
  }

  // =======================
  // = Byte Interpretation =
  // =======================

  function parseString(bytes, limit) {
    var result = '';
    for (var i = 0; i < limit; i += 1) {
      result += (String.fromCharCode(bytes.shift()));
    }
    return result;
  }

  function parseStringConstant(bytes, constant, err) {
    var value = parseString(bytes, constant.length);

    if (value !== constant) {
      throw err;
    }
  }

  function parseVariableInteger(bytes) {
    var b = 0;
    var result = 0;
    do {
      b = bytes.shift();
      if (b >= 0x80) {
        result += (b & 0x7f);
        result <<= 7;
      } else {
        result += b;
      }
    } while (b >= 0x80);
    return result;
  }

  function parseInteger(bytes, limit) {
    var result = 0;
    for (var i = 0; i < limit; i += 1) {
      var shiftAmount = 8 * (limit - i - 1);
      var value = bytes.shift();
      result += (value << shiftAmount);
    }
    return result;
  }

  function toByteString(str) {
    return Array.prototype.map.call(str, function(ch) {
      return (0x00FF & ch.charCodeAt(0));
    });
  }

  return importBinary;

}(MIDITools));
