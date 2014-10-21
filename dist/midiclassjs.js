/**
 * @namespace MIDITools
 */
window.MIDITools = {
  Parsers: {},
  Generators: {},
  Utils: {},
  Errors: {}
};

window.MIDITools.MIDIFile = (function(MIDI, MT) {
  'use strict';
  /*!
   * @class
   * @memberof MIDITools
   */
  function MIDIFile() {
    this._tracks = [];
    this._channels = [];
  }

  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */
  MIDIFile.prototype.play = function() {};
  
  MIDIFile.prototype.getEventsByType = function(type, trackNumber) {
    var track = this._tracks[trackNumber || 0];
    if (!track) return undefined;
    return track.events.filter(function(evt) {
      return (evt.message.type === type);
    });
  };

  MIDIFile.prototype.getEventByType = function(type, trackNumber) {
    return this.getEventsByType(type, trackNumber)[0];
  };

  MIDIFile.prototype.countMessages = function(trackNumber) {
    var track = this._tracks[trackNumber || 0];
    return track.events.length;
  };
  
  MIDIFile.prototype.trackCount = function() {
    return this._tracks.length;
  };
  
  MIDIFile.prototype.getType = function() {
    return this._type;
  };
  
  MIDIFile.prototype.getTrack = function(trackNumber) {
    return this._tracks[trackNumber];
  };
  
  

  return MIDIFile;
}(MIDI, window.MIDITools));



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
    for (var i = 0; i < trackCount; i += 1) {
      m._tracks.push({
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
      if (bytes.length === 0 || evt.message.type === 'endOfTrack') {
        break;
      }
    }

    // a track must always end with an "end track" event
    if (track.events[track.events.length - 1].message.type !== 'endOfTrack') {
      throw MT.Errors.Import.TrackFooter;
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
    track.events.push(evt);
    return evt;
  }

  /*!
   * @throws MT.Errors.Format.MessageType if the message type
   *         is not recognized and there is no running status
   */
  function parseMessage(track, evt, bytes, checkedPrevious) {
    switch (true) {
      case isChannelEvent(evt.status):
        evt.message = parseChannelMessage(evt.status, bytes);
        break;
      case isMetaEvent(evt.status):
        evt.message = parseMetaMessage(evt.status, bytes);
        break;
      case isSysExEvent(evt.status):
        evt.message = parseSysExMessage(evt.status, bytes);
        break;
      case (!checkedPrevious && track.events.length > 0):
        evt.runningStatus = true;
        bytes.unshift(evt.status);
        evt.status = track.events[track.events.length - 1].status;
        parseMessage(track, evt, bytes, true);
        break;
      default:
        throw MT.Errors.Format.MessageType;
    }
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
   * @post msg.kind = 'channel'
   * @post 0x8 <= msg.type <= 0xE
   * @post msg.parameters
   * @returns msg satisfying the post-conditions above
   */
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

    // TODO: document that the parameters are available by name or index
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
    
    if (!spec) {
      throw MT.Errors.Import.MetaType;
    } 
    // TODO: compare length and throw error
    var msg = {
      kind: spec.kind,
      length: length,
      type: spec.type,
      parameters: {}
    };
    var cutLength = (spec.length === 'variable' ? length : spec.length);
    if (spec.length === 'variable') {
      msg.parameters = bytes.slice(0, cutLength);
      msg.parameters.value = valueParsers[spec.valueType](bytes, length);
      for (var i = 0; i < cutLength; i += 1) {
        bytes.shift();
      }
    } else {
      spec.parameters.forEach(function(p) {
        if (p.importers && p.importers.binary) {
          p.importers.binary(parseInteger(bytes, p.length), msg.parameters);
        } else {
          var value = valueParsers[p.valueType](bytes, p.length);
          msg.parameters[p.name] = value;
        }
      });
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


/**
 * @namespace MIDITools.Generators
 */
window.MIDITools.Generators.Binary = (function(MIDI, MT) {
  'use strict';

  // ======================
  // = BEGIN BinaryBuffer =
  // ======================

  // used to simplify binary operations
  function BinaryBuffer(n) {
    this.rep = new Uint8Array(n);
  }

  BinaryBuffer.prototype.append = function(bb) {
    var bbPosition = this.rep.length;
    var result = new Uint8Array(this.rep.length + bb.rep.length);

    result.set(this.rep);
    result.set(bb.rep, bbPosition);

    this.rep = result;
    return this;
  };

  BinaryBuffer.prototype.length = function() {
    return this.rep.byteLength;
  };

  BinaryBuffer.prototype.appendInteger = function(n, bytes) {
    var intBuf = new BinaryBuffer(bytes);
    var result = n;
    for (var i = (bytes - 1); i >= 0; i -= 1) {
      var shiftAmount = 8 * (i);
      var byteValue = (result >> shiftAmount);
      result -= (byteValue * Math.pow(2, shiftAmount));
      intBuf.set(bytes - i - 1, byteValue);
    }
    return this.append(intBuf);
  };


  BinaryBuffer.prototype.appendInt8 = function(n) {
    return this.appendInteger(n, 1);
  };

  BinaryBuffer.prototype.appendInt16 = function(n) {
    return this.appendInteger(n, 2);
  };

  BinaryBuffer.prototype.appendInt32 = function(n) {
    return this.appendInteger(n, 4);
  };

  BinaryBuffer.prototype.appendString = function(str) {
    this.append(stringToBuffer(str));
    return this;
  };

  BinaryBuffer.prototype.appendVariableInteger = function(n) {
    var r = n;
    while (r >= 0x80) {
      var thisByte = r >> 7;
      r -= (thisByte * 0x80);
      thisByte = 0x80 | thisByte;
      this.appendInt8(thisByte);
    }
    this.appendInt8(r);
  };

  BinaryBuffer.prototype.set = function(i, val) {
    this.rep[i] = val;
    return this;
  };

  BinaryBuffer.prototype.get = function(i) {
    return this.rep[i];
  };

  BinaryBuffer.prototype.size = function() {
    return this.rep.length;
  };

  function stringToBuffer(str) {
    var arr = new Uint8Array(str.length);
    for (var i = 0, n = str.length; i < n; i += 1) {
      arr[i] = str.charCodeAt(i);
    }
    var buf = new BinaryBuffer();
    buf.rep = arr;
    return buf;
  }

  // ====================
  // = END BinaryBuffer =
  // ====================
  function exportBinary(m) {
    var b = new BinaryBuffer();
    var header = generateFileHeader(m, b);
    var tracks = generateTracks(m);
    b.append(header).append(tracks);
    return b.rep;
  }

  // TODO: generate frames instead if that's what they're using?
  function generateFileHeader(m) {
    var header = new BinaryBuffer();
    header.appendString('MThd') /* TODO: use constant */
      .appendInt32(6) /* header size: TODO: ever anything but 6? */
      .appendInt16(m.type) /* type */
      .appendInt16(m.tracks.length) /* num tracks */
      .appendInt16(m.timing.ticksPerBeat); /* ticks per beat */
    return header;
  }

  function generateTracks(m) {
    var buffer = new BinaryBuffer();
    m.tracks.forEach(function(track) {
      buffer.appendString('MTrk');
      var evts = generateEvents(track);
      buffer.appendInt32(evts.length());
      buffer.append(evts);
    });
    return buffer;
  }

  function generateEvents(track) {
    var buffer = new BinaryBuffer();
    track.events.forEach(function(event) {
      generateEvent(buffer, event);
    });
    return buffer;
  }

  function generateEvent(buffer, event) {
    buffer.appendVariableInteger(event.timestamp);
    switch (event.message.kind) {
      case 'channel':
        generateChannelMessage(buffer, event.message);
        break;
      case 'meta':
        generateMetaMessage(buffer, event.message);
        break;
      case 'sysex':
        generateSysexMessage(buffer, event.message);
        break;
      default:
        throw new Error('unrecognized event type'); // TODO: Formalize
    }
  }

  function generateChannelMessage(buffer, msg) {
    var statusByte = (MT.Data.typeToBinary[msg.type] << 4) | msg.channel;
    buffer.appendInt8(statusByte);
    buffer.appendInt8(msg.parameters[0]);
    if (msg.parameters[1] !== undefined) {
      buffer.appendInt8(msg.parameters[1]);
    }
  }

  function generateMetaMessage(buffer, msg) {
    buffer.appendInt8(0xFF);
    buffer.appendInt8(MT.Data.typeToBinary[msg.type]);
    var info = MT.Data.typeMap[msg.type];
    if (info.length === 'variable') {
      buffer.appendVariableInteger(msg.parameters.value.length);
    } else {
      buffer.appendVariableInteger(info.length);
    }
  }

  function generateSysexMessage(buffer, event) {

  }


  function generateTrackHeader() {
    return toBytes('MTrk');
  }

  function toBytes(str) {
    var arr = new Uint8Array(new ArrayBuffer(str.length));
    for (var i = 0, n = str.length; i < n; i += 1) {
      arr[i] = str.charCodeAt(i);
    }
    return arr;
  }

  function toString(buffer) {
    var str = '';
    for (var i = 0; i < buffer.size(); i += 1) {
      str += String.fromCharCode(buffer.get(i));
    }
    return str;
  }

  return {
    generate: exportBinary
  };

}(MIDI, window.MIDITools));
window.MIDITools.Utils = (function() {
  'use strict';

  function stringToBytes(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0, n = str.length; i < n; i += 1) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }
  
  return {
    stringToBytes: stringToBytes
  };
}());

window.MIDITools.Errors = (function() {
  'use strict';
  return {
    Import: {
      FileSize: new Error('File is too small to be a standard MIDI file.'),
      HeaderPrelude: new Error('File did not contain standard MIDI header.'),
      HeaderSize: new Error(
        'File size is smaller than its declared header size.'),
      MessageType: new Error('File had a MIDI message with an unknown type.'),
      MetaType: new Error('File had a meta message with an unknown subtype.'),
      TrackCount: new Error('File declared a number of tracks outside 0-16.'),
      TrackLength: new Error(
        'File contains a track declared with the wrong size.'),
      TrackPrelude: new Error(
        'File did not contain standard MIDI track header.'),
      TrackFooter: new Error(
        'File did not contain standard MIDI track footer.'),
      Type: new Error('File must be either Type-0 or Type-1.'),
      Type0MultiTrack: new Error(
        'File format is Type-0, but declares multiple tracks.')
    }
  };
}());
window.MIDITools.Data = (function() {
  'use strict';

  var eventMap = {
    noteOff: {
      kind: 'channel',
      type: 'noteOff',
      parameters: ['note', 'velocity'],
      formats: {
        binary: 0x08,
        text: '',
        xml: ''
      }
    },

    noteOn: {
      kind: 'channel',
      type: 'noteOn',
      parameters: ['note', 'velocity'],
      formats: {
        binary: 0x09,
        text: '',
        xml: ''
      }
    },
    afterTouch: {
      kind: 'channel',
      type: 'afterTouch',
      parameters: ['note', 'amount'],
      formats: {
        binary: 0x0A
      }
    },
    controlChange: {
      kind: 'channel',
      type: 'controlChange',
      parameters: ['controller', 'value'],
      formats: {
        binary: 0x0B
      }
    },
    programChange: {
      kind: 'channel',
      type: 'programChange',
      parameters: ['program'],
      formats: {
        binary: 0x0C
      }
    },
    channelPressure: {
      kind: 'channel',
      type: 'channelPressure',
      parameters: ['amount'],
      formats: {
        binary: 0x0D
      }
    },
    pitchWheel: {
      kind: 'channel',
      type: 'pitchWheel',
      parameters: ['pitchValue1', 'pitchValue2'],
      formats: {
        binary: 0x0E
      }
    },
    sysEx1: {
      kind: 'sysex',
      formats: {
        binary: 0xF0
      }
    },
    sysEx2: {
      kind: 'sysex',
      formats: {
        binary: 0xF7
      }
    },

    sequenceNumber: {
      kind: 'meta',
      type: 'sequenceNumber',
      name: 'Sequence Number',
      length: 2,
      parameters: [{
        name: 'number',
        length: 2,
        valueType: 'number'
      }],
      formats: {
        binary: 0x00,
        text: '',
        xml: ''
      }
    },

    text: {
      kind: 'meta',
      type: 'text',
      name: 'Text',
      length: 'variable',
      formats: {
        binary: 0x01,
        text: '',
        xml: ''
      }
    },

    copyrightNotice: {
      kind: 'meta',
      type: 'copyrightNotice',
      name: 'Copyright Notice',
      length: 'variable',
      formats: {
        binary: 0x02,
        text: '',
        xml: ''
      }
    },

    sequenceTrackName: {
      kind: 'meta',
      type: 'sequenceTrackName',
      name: 'Sequence/Track Name',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x03,
        text: '',
        xml: ''
      }
    },

    instrumentName: {
      kind: 'meta',
      type: 'instrumentName',
      name: 'Instrument Name',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x04,
        text: '',
        xml: ''
      }
    },

    lyrics: {
      kind: 'meta',
      type: 'lyrics',
      name: 'Lyrics',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x05,
        text: '',
        xml: ''
      }
    },

    marker: {
      kind: 'meta',
      type: 'marker',
      name: 'Marker',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x06,
        text: '',
        xml: ''
      }
    },

    cuePoint: {
      kind: 'meta',
      type: 'cuePoint',
      name: 'Cue Point',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x07,
        text: '',
        xml: ''
      }
    },

    midiChannelPrefix: {
      kind: 'meta',
      type: 'midiChannelPrefix',
      name: 'MIDI Channel Prefix',
      length: 1,
      parameters: [{
        name: 'value',
        length: 1,
        valueType: 'number'
      }],
      formats: {
        binary: 0x20,
        text: '',
        xml: ''
      }
    },

    midiPort: {
      kind: 'meta',
      type: 'midiPort',
      name: 'MIDI Port',
      length: 1,
      parameters: [{
        name: 'port',
        length: 1,
        valueType: 'number'
      }],
      formats: {
        binary: 0x21,
        text: '',
        xml: ''
      }
    },

    endOfTrack: {
      kind: 'meta',
      type: 'endOfTrack',
      name: 'End of Track',
      length: 0,
      parameters: [],
      formats: {
        binary: 0x2F
      }
    },

    setTempo: {
      kind: 'meta',
      type: 'setTempo',
      name: 'Set Tempo',
      length: 3,
      parameters: [{
        name: 'microsecondsPerBeat',
        length: 3,
        valueType: 'number'
      }],
      formats: {
        binary: 0x51,
        text: '',
        xml: ''
      }
    },

    smpteOffset: {
      kind: 'meta',
      type: 'smpteOffset',
      name: 'SMPTE Offset',
      length: 5,
      parameters: [{
        name: 'hour',
        length: 1,
        importers: {
          binary: function(hourByte, params) {
            var fpsValues = {
              0: 24,
              1: 25,
              2: 30,
              3: 30
            };

            var fpsBits = hourByte[0] & 0x60; // ignore MSB, grab next 2
            var hourBits = hourByte[0] & 0x1F; // extract 5 LS bits
            params.fps = fpsValues[fpsBits];
            params.hour = hourBits;
          }
        }
      }, {
        name: 'minute',
        length: 1,
        valueType: 'number'
      }, {
        name: 'second',
        length: 1,
        valueType: 'number'
      }, {
        name: 'frames',
        length: 1,
        valueType: 'number'
      }, {
        name: 'sub-frames',
        length: 1,
        valueType: 'number'
      }],
      formats: {
        binary: 0x54,
        text: '',
        xml: ''
      }
    },

    timeSignature: {
      kind: 'meta',
      type: 'timeSignature',
      name: 'Time Signature',
      length: 4,
      parameters: [{
        name: 'numerator',
        length: 1,
        valueType: 'number'
      }, {
        name: 'denominator',
        length: 1,
        importers: {
          binary: function(denomByte, params) {
            params.denominator = Math.pow(2, denomByte);
          }
        }
      }, {
        name: 'metronome',
        length: 1,
        valueType: 'number'
      }, {
        name: 'thirtySeconds',
        length: 1,
        valueType: 'number'
      }],
      formats: {
        binary: 0x58,
        text: '',
        xml: ''
      }
    },

    keySignature: {
      kind: 'meta',
      type: 'keySignature',
      name: 'Key Signature',
      length: 2,
      parameters: [{
        name: 'key',
        length: 1,
        valueType: 'number'
      }, {
        name: 'scale',
        length: 1,
        valueType: 'number'
      }],
      formats: {
        binary: 0x59,
        text: '',
        xml: ''
      }
    },

    sequencerSpecific: {
      kind: 'meta',
      type: 'sequencerSpecific',
      name: 'Sequencer-Specific',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x7F
      }
    }
  };

  var data = {
    binaryMap: {},
    typeMap: {},
    typeToBinary: {},
    eventTypes: {}
  };

  Object.keys(eventMap).forEach(function(k) {
    var val = eventMap[k];
    data.binaryMap[val.formats.binary] = val;
    data.typeMap[k] = val;
    data.typeToBinary[k] = val.formats.binary;
    data.eventTypes[k] = k;

  });

  return data;
}());

(function(exports, MT) {
  exports.importBinary = MT.Parsers.Binary;
}(window.MIDITools, window.MIDITools));