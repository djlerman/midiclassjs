/**
 * @namespace MIDITools
 */
window.MIDITools = {
  Importers: {},
  Exporters: {},
  Utils: {},
  Errors: {}
};

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
        'File format is Type-0, but declares multiple tracks.'),
    },
    Parameters: {
      SetTiming: new Error('setTiming requires a number or a `fps` object.')
    },
    Text: {
      MessageType: new Error('Invalid MIDI message type.')
    }
  };
}());
window.MIDITools.MIDITrack = (function(MIDI, MT) {
  'use strict';

  function MIDITrack(n) {
    this._number = n;
    this._events = [];
    this._eventTypes = {};
  }

  MIDITrack.prototype.event = function(i) {
    return this._events[i];
  };

  MIDITrack.prototype.addEvent = function(evt) {
    var spec = MT.Data.typeMap[evt.message];
    evt.kind = spec.kind;
    var parameters = evt.parameters;
    evt.parameters = {};
    if (spec.length !== 'variable') {
      spec.parameters.forEach(function(p, index) {
        if (parameters[p.name] === 'undefined') {
          // TODO: Create custom error
          throw new Error('Parameter left undefined');
        }
        evt.parameters[p.name] = parameters[p.name];
        evt.parameters[index] = evt.parameters[p.name];
      });
    } else {
      evt.parameters.value = parameters.value;
    }
    this._events.push(evt);
  };

  MIDITrack.prototype.replaceEvent = function(i, evt) {
    this._events[i] = evt;
  };

  MIDITrack.prototype.countEvents = function(trackNumber) {
    return this._events.length;
  };

  MIDITrack.prototype.filterEvents = function(type) {
    return this._events.filter(function(evt) {
      return (evt.message === type);
    });
  };

  return MIDITrack;
}(MIDI, window.MIDITools));

window.MIDITools.MIDIFile = (function(MIDI, MT) {
  'use strict';

  /*!
   * @class
   * @memberof MIDITools
   */
  function MIDIFile(timing) {
    this._tracks = [];
    this._timing = {};
    this._type = 0;
    this._tracks = [];

    if (timing) {
      this.setTiming(timing);
    } else {
      this.setTiming(96);
    }
  }

  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */
  MIDIFile.prototype.play = function() {
    MIDI.Player.loadFile(this.exportBase64(), function() {
      MIDI.Player.start();
    });
  };

  MIDIFile.prototype.type = function() {
    return this._type;
  };

  MIDIFile.prototype.track = function(trackNumber) {
    return this._tracks[trackNumber];
  };

  MIDIFile.prototype.addTrack = function() {
    if (this._type === 0 && this._tracks.length === 1) {
      this._type = 1;
    }
    this._tracks.push(new MIDITools.MIDITrack(this._tracks.length));
  };

  MIDIFile.prototype.countTracks = function() {
    return this._tracks.length;
  };

  MIDIFile.prototype.getTiming = function() {
    // defensive copy
    return JSON.parse(JSON.stringify(this._timing));
  };

  MIDIFile.prototype.setTiming = function(timing) {
    var hasFrameParameters = (
      typeof timing === 'object' &&
      timing.hasOwnProperty('framesPerSecond') &&
      timing.hasOwnProperty('ticksPerFrame')
    );

    if (hasFrameParameters) {
      this._timing.type = 'framesPerSecond';
      this._timing.framesPerSecond = timing.framesPerSecond;
      this._timing.ticksPerFrame = timing.ticksPerFrame;
      this._channels = [];
    } else if (typeof timing === 'number') {
      this._timing.type = 'ticksPerBeat';
      this._timing.ticksPerBeat = timing;
    } else {
      throw MT.Errors.Parameters.SetTiming;
    }
  };

  return MIDIFile;

}(MIDI, window.MIDITools));

(function(MT) { 
  'use strict';

  var MIN_HEADER_LENGTH = 14;
  var HEADER_PRELUDE = 'MThd';
  var TRACK_PRELUDE = 'MTrk';

  MT.MIDIFile.prototype.importBinary = function(src, callback, error) {
    if (!src || !callback) {
      throw new Error('Both parameters required!');
    }

    var midi = this;
    DOMLoader.sendRequest({
      url: src,
      onload: function(req) {
        try {
          callback(fromBinary(midi, toByteString(req.responseText)));
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

  function fromBinary(m, bytes) {
    parseHeader(m, bytes);
    for (var i = 0, n = m.countTracks(); i < n; i += 1) {
      parseTrack(m.track(i), bytes);
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
    m.setTiming(timing);

    // initialize an empty `track` object for each declared track
    for (var i = 0; i < trackCount; i += 1) {
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
        'framesPerSecond': getSMPTE(topByte),
        'ticksPerFrame': bottomByte
      };
  
    } else { // ticks per beat measure
      return parseInteger([topByte, bottomByte], 2);
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

    if (track.event(track.countEvents() - 1).message !== 'endOfTrack') {
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
    } else if (!checkedPrevious && track.countEvents() > 0) {
      evt.runningStatus = true;
      bytes.unshift(evt.status);
      evt.status = track.event(track.countEvents() - 1).status;
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
    evt.channel = channel;
    evt.parameters = {};
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

}(MIDITools));

window.MIDITools.Importers.Text = (function(MT) {
  'use strict';

}(window.MIDITools));

/**
 * @namespace MIDITools.Generators
 */
(function(MIDI, MT) {
  'use strict';

  // ======================
  // = BEGIN BinaryBuffer =
  // ======================

  // used to simplify binary operations
  function BinaryBuffer(n) {
    n = (n ? n : 0) ;
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

  BinaryBuffer.prototype.toString = function() {
    return String.fromCharCode.apply(null, this.rep);
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
  MT.MIDIFile.prototype.exportBinary = function() {
    var b = new BinaryBuffer();
    var header = generateFileHeader(this, b);
    var tracks = generateTracks(this); 
    b.append(header).append(tracks);
    console.log(b);
    return b.toString();
  };

  // TODO: generate frames instead if that's what they're using?
  function generateFileHeader(m) {
    var header = new BinaryBuffer();
    header.appendString('MThd') /* TODO: use constant */
      .appendInt32(6) /* header size: TODO: ever anything but 6? */
      .appendInt16(m.type()) /* type */
      .appendInt16(m.countTracks()) /* num tracks */
      .appendInt16(m.getTiming().ticksPerBeat); /* ticks per beat */
    return header;
  }

  function generateTracks(m) {
    var buffer = new BinaryBuffer();
    for (var i = 0, n = m.countTracks(); i < n; i += 1) {
      buffer.appendString('MTrk');
      var evts = generateEvents(m.track(i));
      buffer.appendInt32(evts.length());
      buffer.append(evts);
    }
    return buffer;
  }

  function generateEvents(track) {
    var buffer = new BinaryBuffer();
    for (var i = 0, n = track.countEvents(); i < n; i += 1) {
      generateEvent(buffer, track.event(i));
    }
    return buffer;
  }

  function generateEvent(buffer, event) {
    buffer.appendVariableInteger(event.timestamp);
    switch (event.kind) {
      case 'channel':
        generateChannelMessage(buffer, event);
        break;
      case 'meta':
        generateMetaMessage(buffer, event);
        break;
      case 'sysex':
        generateSysexMessage(buffer, event);
        break;
      default:
        throw new Error('unrecognized event type'); // TODO: Formalize
    }
  }

  function generateChannelMessage(buffer, evt) {
    var statusByte = (MT.Data.typeToBinary[evt.message] << 4) | evt.channel;
    buffer.appendInt8(statusByte);
    buffer.appendInt8(evt.parameters[0]);
    if (evt.parameters[1] !== undefined) {
      buffer.appendInt8(evt.parameters[1]);
    }
  }

  var valueWriters = {
    'string': function(p, buffer) {
      buffer.appendString(p);
    }
  };

  function generateMetaMessage(buffer, evt) {
    buffer.appendInt8(0xFF);
    buffer.appendInt8(MT.Data.typeToBinary[evt.message]);
    var info = MT.Data.typeMap[evt.message];
    if (info.length === 'variable') {
      buffer.appendVariableInteger(evt.parameters.value.length);
    } else {
      buffer.appendVariableInteger(info.parameters.map(function(p) {
        return p.length;
      }).reduce(function(prev, current) {
        return prev + current;
      }, 0));
    }

    if (info.length === 'variable') {
      valueWriters[info.valueType](evt.parameters.value, buffer);
    } else {
      info.parameters.forEach(function(p) {
        if (p.exporters && p.exporters.binary) {
          p.exporters.binary(evt.parameters[p.name], buffer);
        } else {
          buffer.appendInteger(evt.parameters[p.name], p.length);
        }
      });
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

}(MIDI, window.MIDITools));

window.MIDITools.Utils = (function(MT) {
  'use strict';

  function stringToBytes(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0, n = str.length; i < n; i += 1) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }
  var valueParsers = {
    'string': function(pieces) {
      return pieces.shift();
    },
    'number': function(pieces) {
      return parseInt(pieces.shift());
    }
  };
  
  function bpmToTempo(bpm) {
    return Math.round(60000000 / bpm);
  }
  
  function fromTimeSignature(ts) {
    var pieces = ts.split('/');

    var num = parseInt(pieces[0]);
    var denom = parseInt(pieces[1]);
    
    return {
      numerator: num,
      denominator: denom,
      metronome: 24,
      thirtySeconds: 8
    };
  }
  
  function textToEvent(text) {
    var pieces = text.split(/\s+/);
    if (pieces[0] === 'Meta') {
      // TODO: check that pieces[1] exists
      pieces.shift();
      pieces[0] = 'Meta' + ' ' + pieces[0];
    }
    var spec = MT.Data.textMap[pieces.shift()];
    if (!spec) {
      throw MT.Errors.Text.MessageType;
    }
    
    var evt = {
      kind: spec.kind,
      message: spec.type,
      parameters: {}
    };
    spec.parameters.forEach(function(p, index) {
      if (p.length === 'variable') {
        evt.parameters.value = pieces.join(' ');
      } if (p.importers && p.importers.text) {
        p.importers.text(pieces, evt.parameters);
      } else {
        evt.parameters[p.name] = valueParsers[p.valueType](pieces);
      }
    });
    
    return evt;
  }
  return {
    stringToBytes: stringToBytes,
    textToEvent: textToEvent,
    bpmToTempo: bpmToTempo,
    fromTimeSignature: fromTimeSignature
  };
}(window.MIDITools));

window.MIDITools.Data = (function() {
  'use strict';
  var strings = {

  };

  var eventMap = {
    noteOff: {
      kind: 'channel',
      type: 'noteOff',
      parameters: [{
        name: 'note',
        valueType: 'number'
      }, {
        name: 'velocity',
        valueType: 'number'
      }],
      formats: {
        binary: 0x08,
        text: 'Off',
        xml: ''
      }
    },

    noteOn: {
      kind: 'channel',
      type: 'noteOn',
      parameters: [{
        name: 'note',
        valueType: 'number'
      }, {
        name: 'velocity',
        valueType: 'number'
      }],
      formats: {
        binary: 0x09,
        text: 'On',
        xml: ''
      }
    },
    afterTouch: {
      kind: 'channel',
      type: 'afterTouch',
      parameters: [{
        name: 'note',
        valueType: 'number'
      }, {
        name: 'amount',
        valueType: 'number'
      }],
      formats: {
        binary: 0x0A,
        text: 'PoPr',
        xml: ''
      }
    },
    controlChange: {
      kind: 'channel',
      type: 'controlChange',
      parameters: [{
        name: 'controller',
        valueType: 'number'
      }, {
        name: 'value',
        valueType: 'number'
      }],
      formats: {
        binary: 0x0B,
        text: 'Par',
        xml: ''
      }
    },
    programChange: {
      kind: 'channel',
      type: 'programChange',
      parameters: [{
        name: 'program',
        valueType: 'number'
      }],
      formats: {
        binary: 0x0C,
        text: 'PrCh',
        xml: ''
      }
    },
    channelPressure: {
      kind: 'channel',
      type: 'channelPressure',
      parameters: [{
        name: 'amount',
        valueType: 'number'
      }],
      formats: {
        binary: 0x0D,
        text: 'ChPr',
        xml: ''
      }
    },
    pitchWheel: {
      kind: 'channel',
      type: 'pitchWheel',
      parameters: [{
        name: 'pitchValue1',
        valueType: 'number'
      }, {
        name: 'pitchValue2',
        valueType: 'number'
      }],
      formats: {
        binary: 0x0E,
        text: 'Pb',
        xml: ''
      }
    },
    sysEx1: {
      kind: 'sysex',
      formats: {
        binary: 0xF0,
        text: 'SysEx',
        xml: ''
      }
    },
    sysEx2: {
      kind: 'sysex',
      formats: {
        binary: 0xF7,
        text: 'Arb',
        /* TODO: CHECK */
        xml: ''
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
        text: 'Seqnr',
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
        text: 'Meta Text',
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
        text: 'Meta Copyright',
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
        text: 'Meta TrkName',
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
        text: 'Meta Lyric',
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
        text: 'Meta Marker',
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
        text: 'Meta Cue',
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
        text: 'Meta 0x21',
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
        binary: 0x2F,
        text: 'Meta TrkEnd',
        xml: ''
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
        text: 'Tempo',
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
        text: 'SMPTE',
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
        valueType: 'number',
        decoder: function(value, params) {
          params.denominator = Math.pow(2, value);
        },
        encoder: function(value, params) {
          var encoded = Math.round(Math.log(value)/Math.log(2));
          params.denominator = encoded;
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
        text: 'TimeSig',
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
        text: 'KeySig',
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
    eventTypes: {},
    textMap: {},
    GeneralMIDI: {
      byName: {
       'synth_drum': 114 
      }
    }
  };

  Object.keys(eventMap).forEach(function(k) {
    var val = eventMap[k];
    data.binaryMap[val.formats.binary] = val;
    data.textMap[val.formats.text] = val;
    data.typeMap[k] = val;
    data.typeToBinary[k] = val.formats.binary;
    data.eventTypes[k] = k;
  });
  

  return data;
}());

window.MIDITools.Builder = (function(imports, exports) {
  'use strict';

  function MIDISequence() {
    this._midi = new imports.MIDIFile();
    this._midi.addTrack(); // meta information
    this._channels = [];
    this._tempo = 120;
    this._ts = '4/4';
    this._midi.track(0).addEvent({
      message: 'setTempo',
      timestamp: 0,
      parameters: {
        microsecondsPerBeat: imports.Utils.bpmToTempo(this._tempo)
      }
    });
    this._midi.track(0).addEvent({
      message: 'timeSignature',
      timestamp: 0,
      parameters: imports.Utils.fromTimeSignature('4/4')
    });
    this._meta = {
      tempo: this._midi.track(0).event(0),
      timeSignature: this._midi.track(0).event(1)
    };
  }

  MIDISequence.prototype.getTempo = function() {
    return this._tempo;
  };

  MIDISequence.prototype.ticksPerBeat = function() {
    return this._midi.getTiming().ticksPerBeat;
  };

  MIDISequence.prototype.setTempo = function(bpm) {
    this._tempo = bpm;
    this._meta.tempo.parameters.microsecondsPerBeat = imports.Utils.bpmToTempo(
      bpm);
  };

  MIDISequence.prototype.getTimeSignature = function() {
    return {
      numerator: this._meta.timeSignature.parameters.numerator,
      denominator: this._meta.timeSignature.parameters.denominator
    };
  };

  MIDISequence.prototype.setTimeSignature = function(ts) {
    this._ts = ts;
    this._meta.timeSignature.parameters = imports.Utils.fromTimeSignature(ts);
  };


  MIDISequence.prototype.channel = function(n) {
    if (!this._channels[n]) {
      var trackCount = this._midi.countTracks();
      if (trackCount !== Math.pow(2, 16)) {
        this._midi.addTrack();
      } else {
        trackCount -= 1; // reduce index
      }
      this._channels[n] = new MIDIChannel(this._midi.track(trackCount), n);
    }
    return this._channels[n];
  };

  MIDISequence.prototype.toFile = function() {
    for (var i = 0, n = this._midi.countTracks(); i < n; i += 1) {
      this._midi.track(i).addEvent({
        message: 'endOfTrack',
        timestamp: 0,
        parameters: {}
      });
    }
    return this._midi;
  };

  function MIDIChannel(t, n) {
    this._track = t;
    this._number = n;
    this._track.addEvent({
      timestamp: 0,
      message: 'midiChannelPrefix',
      parameters: {
        value: this._number
      }
    });
    this._track.addEvent({
      timestamp: 0,
      message: 'instrumentName',
      parameters: {
        value: 'unknown'
      }
    });
    this.addEvent(0, 'programChange', {
      program: 1
    });
    this._nameParam = this._track.event(1).parameters;
    this._program = this._track.event(2).parameters;
  }

  MIDIChannel.prototype.setName = function(name) {
    this._nameParam.value = name;
  };

  MIDIChannel.prototype.getName = function(bpm) {
    return this._nameParam.value;
  };

  MIDIChannel.prototype.setInstrument = function(name) {
    console.log(name);
    this._program.program = imports.Data.GeneralMIDI.byName[name];
    // TODO: Use replace event
    console.log(this._program);
  };

  MIDIChannel.prototype.getInstrument = function(bpm) {
    return this._program.program;
  };

  MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
    var spec = imports.Data.typeMap[msg];
    var evt = {
      timestamp: delta,
      channel: this._number,
      message: spec.type,
      parameters: parameters
    };

    this._track.addEvent(evt);
  };

  exports.MIDISequence = MIDISequence;

}(window.MIDITools, window.MIDITools));

(function(exports, Tools) {
  exports.createMIDI = function() {
    return new Tools.MIDIFile();
  };
  
  exports.textToEvent = Tools.Utils.textToEvent;

  Tools.MIDIFile.prototype.exportBase64 = function() {
    return 'base64,' + btoa(this.exportBinary());
  };

}(window.MIDITools, window.MIDITools));
