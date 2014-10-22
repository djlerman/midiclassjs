window.MIDITools.Importers.Binary = (function(MT) {
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
    for (var i = 0, n = m._tracks.length; i < n; i += 1) {
      parseTrack(m._tracks[i], bytes);
    }
    return m;
  }


  //
  // ## Parsing the header chunk
  //

  /*!
   * @post m._type is set to either 0 or 1
   * @post m._trackCount set according to header's track count
   * @post m._tracks contains `m._trackCount` empty tracks
   * @post m._timing.type is one of "framesPerSecond" or "ticksPerBeat"
   * @post m._timing defines either "ticksPerFrame" or both
   *       "framesPerSecond" and "ticksPerFrame"
   */

  function parseHeader(m, bytes) {

    // The format of the header is specified in the
    // [Binary format document](../ref/binary.html).    

    // sanity check: die for files that aren't big enough
    // to even declare a MIDI header
    if (bytes.length < MIN_HEADER_LENGTH) {
      throw MT.Errors.Import.FileSize;
    }

    // sanity check: Any MIDI file must begin with the `MTrk` constant.
    parseStringConstant(bytes, HEADER_PRELUDE, MT.Errors.Import.HeaderPrelude);
    var headerSize = parseHeaderSize(bytes);
    var midiType = parseType(bytes);
    var trackCount = parseInteger(bytes, 2);
    var timing = parseTimeDivision(bytes);

    // sanity check: a Type-0 file that declares multiple tracks
    // is just asking for trouble; we fail appropriately
    if (midiType === 0 && trackCount !== 1) {
      throw MT.Errors.Import.Type0MultiTrack;
    }

    // Since the header contains globally-useful information,
    // we store the results in the `MIDIFile` object itself
    m._type = midiType;
    m._trackCount = trackCount;
    m._timing = timing;

    // initialize an empty `track` object for each declared track
    for (var i = 1; i < trackCount; i += 1) {
      m.addTrack();
    }
  }


  /*!
   * Returns header's file size declaration,
   * if and only if it agrees with actual file size.
   *
   * @throws MT.Errors.Import.HeaderSize if size declaration and
   *         file size do not agree
   */

  function parseHeaderSize(bytes) {
    var size = parseInteger(bytes, 4);
    if (bytes.length < size) {
      throw MT.Errors.Import.HeaderSize;
    } else {
      return size;
    }
  }


  /*!
   * Returns the MIDI file type,
   * if and only if the type is in {0, 1}.
   *
   * @throws MT.Errors.Import.Type if the type is not 0 or 1
   */

  function parseType(bytes) {
    var type = parseInteger(bytes, 2);
    if (type !== 0 && type !== 1) {
      throw MT.Errors.Import.Type;
    } else {
      return type;
    }
  }


  /*!
   * Returns a `timing` object, which contains a `type` and
   * associated timing values.
   */

  function parseTimeDivision(bytes) {
    var topByte = parseInteger(bytes, 1);
    var bottomByte = parseInteger(bytes, 1);

    if (topByte & 0x80) {
      return {
        'type': 'framesPerSecond',
        'framesPerSecond': getSMPTE(topByte),
        'ticksPerFrame': bottomByte
      };
    } else { // ticks per beat measure
      return {
        'type': 'ticksPerBeat',
        'ticksPerBeat': parseInteger([topByte, bottomByte], 2)
      };
    }
  }


  /*!
   * Parses two-byte value as an SMPTE value
   * TODO: elaborate
   */

  function getSMPTE(byte) {
    var negated = (byte ^ 0xFF) + 1; // negation in twos-complement
    return Math.abs(negated);
  }


  //
  // ## Parsing the Track chunks
  //


  /*!
   * Parses a binary representation of a MIDI track, adding
   * the events and metadata contained within to the `track`
   * parameter.
   *
   * @throws MT.Errors.Import.TrackPrelude
   * @throws MT.Errors.Import.TrackSize
   * @throws MT.Errors.Import.TrackFooter
   */

  function parseTrack(track, bytes) {

    // The complete format is documented in the
    // [binary format document](../ref/binary.html), but
    // a track basically consists of an eight-byte header, followed by
    // a sequence of events.

    parseTrackHeader(track, bytes);

    while (true) {
      var evt = parseEvent(track, bytes);
        track.addEvent(evt);
      if (bytes.length === 0 || evt.message === 'endOfTrack') {
        break;
      }
    }

    track.events.pop(); // remove extra 'endOfTrack' event
    // a track must always end with an "end track" event
    if (track.events[track.events.length - 1].message !== 'endOfTrack') {
      throw MT.Errors.Import.TrackFooter;
    } else {
    }
  }


  /*!
   * @throws {MIDITools.Errors.Import.TrackPrelude} if the track declaration
   *         does not appear or is invalid
   * @throws {MIDITools.Errors.Import.TrackLength} if size declaration
   *         is greater than remaining file size
   */

  function parseTrackHeader(track, bytes) {
    parseStringConstant(bytes, TRACK_PRELUDE, MT.Errors.Import.TrackPrelude);
    var size = parseInteger(bytes, 4);
    if (bytes.length < size) {
      throw MT.Errors.Import.TrackLength;
    } else {
      return size;
    }
  }


  //
  // ## Event/Message Parsing
  //


  /*!
   * Adds the next event representation in `bytes` to `track`, and returns
   * the event parsed.
   *
   * @post evt.timestamp = value of variable-length integer starting at bytes[0]
   * @post evt.status = value of the byte following the variable-length integer
   * @post evt.message = value according to post-conditions of parseMessage
   * @return evt which satisfies the post-conditions above
   */
  function parseEvent(track, bytes) {

    // An event consists of two distinct pieces:
    // a *delta-time* and a *message*. The delta-time is a
    // [variable-length integer](../ref/binary.html#varint),
    // and the message is parsed based on the *status byte*,
    // the first byte of the message

    var evt = {
      timestamp: parseVariableInteger(bytes),
      status: parseInteger(bytes, 1)
    };

    parseMessage(track, evt, bytes);
    return evt;
  }

  /*!
   * @throws MT.Errors.Import.MessageType if the message type
   *         is not recognized and there is no running status
   */
  function parseMessage(track, evt, bytes, checkedPrevious) {
    if (isChannelEvent(evt.status)) {
      parseChannelMessage(evt, bytes);
    } else if (isMetaEvent(evt.status)) {
      parseMetaMessage(evt, bytes);
    } else if (isSysExEvent(evt.status)) {
      parseSysExMessage(evt, bytes);
    } else if (!checkedPrevious && track.events.length > 0) {
      evt.runningStatus = true;
      bytes.unshift(evt.status);
      evt.status = track.events[track.events.length - 2].status;
      parseMessage(track, evt, bytes, true);
    } else {
      throw MT.Errors.Import.MessageType;
    }
    return evt;
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

  /*!
   * @post evt.kind = 'channel'
   * @post 0x8 <= evt.message <= 0xE
   * @returns msg satisfying the post-conditions above
   */
  function parseChannelMessage(evt, bytes) {
    var type = (evt.status & 0xF0) >> 4;
    var channel = (evt.status & 0x0F) >> 4;
    var spec = MT.Data.binaryMap[type];

    evt.kind = spec.kind;
    evt.message = spec.type;
    evt.parameters = {};
    evt.channel = channel;
    // TODO: document that the parameters are available by name or index
    spec.parameters.forEach(function(p, index) {
      evt.parameters[p.name] = parseInteger(bytes, 1);
      evt.parameters[index] = evt.parameters[p.name];
    });

    return evt;
  }

  var valueParsers = {
    'string': parseString,
    'number': parseInteger
  };

  function parseMetaMessage(evt, bytes) {
    var type = parseInteger(bytes, 1);
    var length = parseInteger(bytes, 1);
    var spec = MT.Data.binaryMap[type];
    
    if (!spec) {
      throw MT.Errors.Import.MetaType;
    } 
    // TODO: compare length and throw error

    evt.kind = spec.kind;
    evt.message = spec.type;
    evt.parameters = {};

    var cutLength = (spec.length === 'variable' ? length : spec.length);
    if (spec.length === 'variable') {
      evt.parameters.value = valueParsers[spec.valueType](bytes, length);
      for (var i = 0; i < cutLength; i += 1) {
        bytes.shift();
      }
    } else {
      // TODO: document that the parameters are available by name or index
      spec.parameters.forEach(function(p, index) {
        if (p.importers && p.importers.binary) {
          p.importers.binary(parseInteger(bytes, p.length), evt.parameters);
        } else {
          var value = valueParsers[p.valueType](bytes, p.length);
          evt.parameters[p.name] = value;
          evt.parameters[index] = evt.parameters[p.name];
        }
      });
    }

    return evt;      
  }

  function parseSysExMessage(evt, bytes) {
    var length = parseVariableInteger(bytes);

    evt.kind = MT.Data.binaryMap[evt.status].kind;
    evt.message = 'unknown'; // TODO: FIX

    evt.parameters = bytes.slice(0, length);
    for (var i = 0; i < length; i += 1) {
      bytes.shift();
    }
    return evt;
  }


  //
  // ## Byte Interpretation
  //


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

window.MIDITools.Importers.Text = (function(MT) {
  'use strict';

}(window.MIDITools));