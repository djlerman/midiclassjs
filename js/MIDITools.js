window.MIDITools = {};

/*!
 * MIDIFile API
 */
window.MIDITools.MIDIFile = (function(MIDI, MT) {
  /**
   * Represents a sequence of MIDI messages.
   */
  function MIDIFile(ticksPerBeat) {
    this.type = 0; // TODO: should we just make this type 1?
    this.ticksPerBeat = ticksPerBeat;
    this.tracks = [];
    this.channels = [];
  }

  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */

  MIDIFile.prototype.play = function() {};
  MIDIFile.prototype.getEventsByType = function(type, trackNumber) {
    var track = this.tracks[trackNumber || 0];
    if (!track) return undefined;
    return track.events.filter(function(evt) {
      return (evt.message.type === type);
    });
  };

  MIDIFile.prototype.getEventByType = function(type, trackNumber) {
    return this.getEventsByType(type, trackNumber)[0];
  };

  MIDIFile.prototype.countMessages = function(trackNumber) {
    var track = this.tracks[trackNumber || 0];
    return track.events.length;
  };

  return MIDIFile;
}(MIDI, window.MIDITools));

window.MIDITools.Parsers = {};

window.MIDITools.Parsers.binary = (function(MIDI, MT) {
  'use strict';

  var MIN_HEADER_LENGTH = 14;
  var HEADER_PRELUDE = 'MThd';
  var TRACK_PRELUDE = 'MTrk';

  /**
   * @param{} src
   */
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

  function fromBinary(bytes) {
    var m = new MT.MIDIFile(0);
    parseHeader(m, bytes);
    parseTracks(m, bytes);
    return m;
  }

  // ============================
  // = MIDI File Header Parsing =
  // ============================

  function parseHeader(m, bytes) {
    parseHeaderPrelude(bytes);
    var headerSize = parseHeaderSize(bytes);
    m.type = parseType(bytes);

    parseTracksDeclaration(m, bytes);
    m.ticksPerBeat = parseHeaderTPB(bytes);
  }

  function parseHeaderTPB(bytes) {
    return parseInteger(bytes, 2);
  }

  function parseTracksDeclaration(m, bytes) {
    var trackCount = parseTrackCount(bytes);
    if (m.type === 0 && trackCount !== 1) {
      throw MT.Errors.Format.Type0MultiTrack;
    }
    for (var i = 0; i < trackCount; i += 1) {
      m.tracks.push({
        number: i,
        events: [],
        eventTypes: {}
      });
    }
  }

  function parseHeaderPrelude(bytes) {
    // first, check length requirement
    if (bytes.length < MIN_HEADER_LENGTH) {
      throw MT.Errors.Format.FileSize;
    }
    parseStringConstant(bytes, HEADER_PRELUDE, MT.Errors.Format.HeaderPrelude);
  }

  function parseHeaderSize(bytes) {
    var size = parseInteger(bytes, 4);
    if (bytes.length < size) {
      throw MT.Errors.Format.HeaderSize;
    } else {
      return size;
    }
  }

  function parseTrackCount(bytes) {
    return parseInteger(bytes, 2);
  }

  function parseType(bytes) {
    var type = parseInteger(bytes, 2);
    if (type !== 0 && type !== 1) {
      throw MT.Errors.Format.Type;
    } else {
      return type;
    }
  }

  // ======================
  // = MIDI Track Parsing =
  // ======================

  function parseTracks(m, bytes) {
    for (var i = 0, n = m.tracks.length; i < n; i += 1) {
      parseTrack(m.tracks[i], bytes);
    }
  }

  function parseTrack(track, bytes) {
    parseTrackHeader(track, bytes);
    parseTrackEvents(track, bytes);
  }

  function parseTrackHeader(track, bytes) {
    parseTrackPrelude(bytes);
    track.length = parseTrackLength(bytes);
    track.bytes = bytes;
  }

  function parseTrackLength(bytes) {
    var size = parseInteger(bytes, 4);
    if (bytes.length < size) {
      throw MT.Errors.Format.TrackLength;
    } else {
      return size;
    }
  }

  function parseTrackPrelude(bytes) {
    parseStringConstant(bytes, TRACK_PRELUDE, MT.Errors.Format.TrackPrelude);
  }

  function parseTrackEvents(track, bytes) {
    while (true) {
      var evt = parseEvent(track, bytes);
      if (bytes.length === 0 || evt.message.type === 'endOfTrack') {
        break;
      }
    }
  }

  // ================================
  // = MIDI Message / Event Parsing =
  // ================================

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

}(MIDI, MIDITools));


/*
 * Generators
 */
window.MIDITools.Generators = {};
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

  function generateFileHeader(m) {
    var header = new BinaryBuffer();
    header.appendString('MThd') /* TODO: use constant */
      .appendInt32(6) /* header size: TODO: ever anything but 6? */
      .appendInt16(m.type) /* type */
      .appendInt16(m.tracks.length) /* num tracks */
      .appendInt16(m.ticksPerBeat); /* ticks per beat */
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
      case 'channel': {
        generateChannelMessage(buffer, event.message);
        break;
      }
      case 'meta': {
        generateMetaMessage(buffer, event.message);
        break;
      }
      case 'sysex': {
        generateSysexMessage(buffer, event.message);
        break;
      }
      default: {
        throw new Error('unrecognized event type'); // TODO: Formalize
      }
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


/*
 * Errors
 */
window.MIDITools.Errors = (function(MT) {
  'use strict';
  return {
    Format: {
      FileSize: new Error('File is too small to be a standard MIDI file.'),
      HeaderPrelude: new Error('File did not contain standard MIDI header.'),
      HeaderSize: new Error(
        'File size is smaller than its declared header size.'),
      TrackCount: new Error('File declared a number of tracks outside 0-16.'),
      TrackLength: new Error(
        'File contains a track declared with the wrong size.'),
      TrackPrelude: new Error(
        'File did not contain standard MIDI track header.'),
      Type: new Error('File must be either Type-0 or Type-1.'),
      Type0MultiTrack: new Error(
        'File format is Type-0, but declares multiple tracks.')
    }
  };
}(MIDITools));

window.MIDITools.Utils = (function(MT) {
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

}(MIDITools));
window.MIDITools.Data = (function(MT) {
  'use strict';
  var eventMap = {};

  eventMap['noteOff'] = {
    kind: 'channel',
    type: 'noteOff',
    parameters: ['note', 'velocity'],
    formats: {
      binary: 0x08,
    }
  };

  eventMap['noteOn'] = {
    kind: 'channel',
    type: 'noteOn',
    parameters: ['note', 'velocity'],
    formats: {
      binary: 0x09,
    }
  };

  eventMap['afterTouch'] = {
    kind: 'channel',
    type: 'afterTouch',
    parameters: ['note', 'amount'],
    formats: {
      binary: 0x0A,
    }
  };
  eventMap['controlChange'] = {
    kind: 'channel',
    type: 'controlChange',
    parameters: ['controller', 'value'],
    formats: {
      binary: 0x0B,
    }
  };
  eventMap['programChange'] = {
    kind: 'channel',
    type: 'programChange',
    parameters: ['program'],
    formats: {
      binary: 0x0C,
    }
  };
  eventMap['channelPressure'] = {
    kind: 'channel',
    type: 'channelPressure',
    parameters: ['amount'],
    formats: {
      binary: 0x0D,
    }
  };
  eventMap['pitchWheel'] = {
    kind: 'channel',
    type: 'pitchWheel',
    parameters: ['pitchValue1', 'pitchValue2'],
    formats: {
      binary: 0x0E,
    }
  };
  eventMap['sysEx1'] = {
    kind: 'sysex',
    formats: {
      binary: 0xF0,
    }
  };
  eventMap['sysEx2'] = {
    kind: 'sysex',
    formats: {
      binary: 0xF7,
    }
  };

  eventMap['sequenceNumber'] = {
    kind: 'meta',
    type: 'sequenceNumber',
    name: 'Sequence Number',
    length: 2,
    parameters: [{
      name: 'number',
      bytes: 2
    }],
    formats: {
      binary: 0x00,
    }
  };

  eventMap['text'] = {
    kind: 'meta',
    type: 'text',
    name: 'Text',
    length: 'variable',
    formats: {
      binary: 0x01,
    }
  };

  eventMap['copyrightNotice'] = {
    kind: 'meta',
    type: 'copyrightNotice',
    name: 'Copyright Notice',
    length: 'variable',
    formats: {
      binary: 0x02,
    }
  };

  eventMap['sequenceTrackName'] = {
    kind: 'meta',
    type: 'sequenceTrackName',
    name: 'Sequence/Track Name',
    length: 'variable',
    valueType: 'string',
    formats: {
      binary: 0x03,
    }
  };

  eventMap['instrumentName'] = {
    kind: 'meta',
    type: 'instrumentName',
    name: 'Instrument Name',
    length: 'variable',
    valueType: 'string',
    formats: {
      binary: 0x04,
    }
  };

  eventMap['lyrics'] = {
    kind: 'meta',
    type: 'lyrics',
    name: 'Lyrics',
    length: 'variable',
    valueType: 'string',
    formats: {
      binary: 0x05,
    }
  };

  eventMap['marker'] = {
    kind: 'meta',
    type: 'marker',
    name: 'Marker',
    length: 'variable',
    valueType: 'string',
    formats: {
      binary: 0x06,
    }
  };

  eventMap['cuePoint'] = {
    kind: 'meta',
    type: 'cuePoint',
    name: 'Cue Point',
    length: 'variable',
    valueType: 'string',
    formats: {
      binary: 0x07,
    }
  };

  eventMap['midiChannelPrefix'] = {
    kind: 'meta',
    type: 'midiChannelPrefix',
    name: 'MIDI Channel Prefix',
    length: 1,
    parameters: [{
      name: 'value',
      bytes: 1
    }],
    formats: {
      binary: 0x20,
    }
  };

  eventMap['midiPort'] = {
    kind: 'meta',
    type: 'midiPort',
    name: 'MIDI Port',
    length: 1,
    parameters: [{
      name: 'port',
      bytes: 1
    }],
    formats: {
      binary: 0x21,
    }
  };

  eventMap['endOfTrack'] = {
    kind: 'meta',
    type: 'endOfTrack',
    name: 'End of Track',
    length: 0,
    parameters: [],
    formats: {
      binary: 0x2F,
    }
  };

  eventMap['setTempo'] = {
    kind: 'meta',
    type: 'setTempo',
    name: 'Set Tempo',
    length: 3,
    parameters: [{
      name: 'microsecondsPerBeat',
      bytes: 3
    }],
    formats: {
      binary: 0x51
    }
  };

  eventMap['smpteOffset'] = {
    kind: 'meta',
    type: 'smpteOffset',
    name: 'SMPTE Offset',
    length: 5,
    parameters: [{
      name: 'hour',
      bytes: 1,
      parsers: {
        binary: function(hourByte, params) {
          var fpsValues = {
            0: 24,
            1: 25,
            2: 30,
            3: 30,
          };

          var fpsBits = paramBytes[0] & 0x60; // ignore MSB, grab next 2
          var hourBits = paramBytes[0] & 0x1F; // extract least-significant 5 bits
          params.fps = fpsValues[fpsBits];
          params.hour = hourBits;
        }
      }
    }, {
      name: 'minute',
      bytes: 1
    }, {
      name: 'second',
      bytes: 1
    }, {
      name: 'frames',
      bytes: 1
    }, {
      name: 'sub-frames',
      bytes: 1
    }],
    formats: {
      binary: 0x54
    }
  };

  eventMap['timeSignature'] = {
    kind: 'meta',
    type: 'timeSignature',
    name: 'Time Signature',
    length: 4,
    parameters: [{
      name: 'numerator',
      bytes: 1
    }, {
      name: 'denominator',
      bytes: 1
    }, {
      name: 'metronome',
      bytes: 1
    }, {
      name: 'thirtySeconds',
      bytes: 1
    }],
    formats: {
      binary: 0x58
    }
  };

  eventMap['keySignature'] = {
    kind: 'meta',
    type: 'keySignature',
    name: 'Key Signature',
    length: 2,
    parameters: [{
      name: 'key',
      bytes: 1
    }, {
      name: 'scale',
      bytes: 1
    }],
    formats: {
      binary: 0x59
    }
  };

  eventMap['sequencerSpecific'] = {
    kind: 'meta',
    type: 'sequencerSpecific',
    name: 'Sequencer-Specific',
    length: 'variable',
    valueType: 'string',
    formats: {
      binary: 0x7F
    }
  };

  var data = {
    binaryMap: {},
    typeMap: {},
    typeToBinary: {},
  };

  Object.keys(eventMap).forEach(function(k) {
    var val = eventMap[k];
    data.binaryMap[val.formats.binary] = val;
    data.typeMap[k] = val;
    data.typeToBinary[k] = val.formats.binary;
  });

  return data;
}(window.MIDITools));


window.MIDITools.importBinary = window.MIDITools.Parsers.binary;
