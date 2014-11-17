(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var strings = {

};

var eventMap = {
  noteOff: {
    kind: 'channel',
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
        var encoded = Math.round(Math.log(value) / Math.log(2));
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
    name: 'Sequencer-Specific',
    length: 'variable',
    valueType: 'string',
    formats: {
      binary: 0x7F
    }
  }
};

exports.binaryMap = {};
exports.typeMap = {};
exports.typeToBinary = {};
exports.eventTypes = {};
exports.textMap = {};
exports.GeneralMIDI = {
  byName: {
    'synth_drum': 114
  }
};

Object.keys(eventMap).forEach(function(k) {
  var val = eventMap[k];
  val.message = k;
  exports.binaryMap[val.formats.binary] = val;
  exports.textMap[val.formats.text] = val;
  exports.typeMap[k] = val;
  exports.typeToBinary[k] = val.formats.binary;
  exports.eventTypes[k] = k;
});

},{}],2:[function(require,module,exports){
'use strict';

exports.MIDI = {
  TrackOverflow: new Error(
    'addTrack called on MIDIFile with 2^16 tracks.')
};

exports.Import = {
  DeltaInvalid: new Error('Event contained an invalid delta-time value'),

  FileSize: new Error('File is too small to be a standard MIDI file.'),

  HeaderPrelude: new Error('File did not contain standard MIDI header.'),

  HeaderSize: new Error('File size is smaller than its declared header size.'),

  MessageType: new Error('File had a MIDI message with an unknown type.'),

  MetaType: new Error('File had a meta message with an unknown subtype.'),

  TrackCount: new Error('File declared a number of tracks outside 0-(2^16).'),

  TrackLength: new Error('File contains a track declared with the wrong size.'),

  TracksMissing: new Error('File does not contain as many tracks it declares.'),

  TrackPrelude: new Error('File did not contain standard MIDI track header.'),

  TrackFooter: new Error('File did not contain standard MIDI track footer.'),

  Type: new Error('File must be either Type-0 or Type-1.'),

  Type0MultiTrack: new Error(
    'File format is Type-0, but declares multiple tracks.')
};

exports.Parameters = {
  SetTiming: new Error('setTiming requires a number or a `fps` object.')
};

},{}],3:[function(require,module,exports){
'use strict';

/*!
 * Module dependencies
 */

var MIDITrack = require('./MIDITrack');
var errors = require('./errors');
var importers = require('./importers');
var exporters = require('./exporters');


/**
 * Creates a new MIDIFile
 * @classdesc A representation of a standard MIDI file (SMF).
 * @class
 * @memberof MIDITools
 */

function MIDIFile(type) {
  this._tracks = [];
  this._timing = {};
  this._type = (type === 0 || type === 1) ? type : 0;
  this._tracks = [];
  this.setTiming(96);
}


/**
 * @returns {Number} the type (0 or 1) of the MIDI file
 */

MIDIFile.prototype.type = function() {
  return this._type;
};


/**
 * @returns {MIDITools.MIDITrack} the track at index `n`
 */

MIDIFile.prototype.track = function(n) {
  return this._tracks[n];
};


/**
 * Adds a new, empty track to the file, then returns the track.
 * @returns {MIDITools.MIDITrack} the newly-added track
 */

MIDIFile.prototype.addTrack = function() {
  if (this._tracks.length === Math.pow(2, 16)) {
    throw errors.MIDI.TrackOverflow;
  }

  if (this._type === 0 && this._tracks.length === 1) {
    this._type = 1;
  }

  this._tracks.push(new MIDITrack(this._tracks.length));
  return this._tracks[this._tracks.length];
};


/**
 * @returns {Number} total number of tracks stored in the MIDIFile
 */

MIDIFile.prototype.countTracks = function() {
  return this._tracks.length;
};


MIDIFile.prototype.exportBase64 = function() {
  return 'base64,' + window.btoa(this.exportBinary());
};


/**
 * @returns the timing of the MIDIFile, which is usually a measure
 *          of *ticks per beat*; see ??? for details
 * TODO: put reference in above description
 */

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
    throw errors.Parameters.SetTiming;
  }
};

function toByteString(str) {
  return Array.prototype.map.call(str, function(ch) {
    return (0x00FF & ch.charCodeAt(0));
  });
}

MIDIFile.importBinary = function(src, callback, error) {
  if (!src || !callback) {
    throw new Error('Both parameters required!');
  }

  DOMLoader.sendRequest({
    url: src,
    onload: function(req) {
      try {
        return callback(importers.binary(
          new MIDIFile(), toByteString(req.responseText)));
      } catch (err) {
        return (error && error(err)) || false;
      }
    },
    onerror: function() {
      // TODO: replace with custom error type?
      throw new Error('Could not load file');
    }
  });
};


MIDIFile.importText = function(text) {
  return importers.text(new MIDIFile(), text);
};


MIDIFile.prototype.exportBinary = function() {
  return exporters.binary(this);
};

module.exports = MIDIFile;

},{"./MIDITrack":5,"./errors":7,"./exporters":10,"./importers":12}],4:[function(require,module,exports){
'use strict';
var MIDIFile = require('./MIDIFile');
var errors = require('./errors');
var data = require('./data');
var util = require('./util');

function MIDISequence() {
  this._midi = new MIDIFile();
  this._channels = [];
  this._tempo = 120;
  this._ts = '4/4';


  this._midi.addTrack(); // meta information
  this._midi.track(0).addEvent({
    message: 'sequenceTrackName',
    timestamp: 0,
    parameters: {
      value: 'Untitled'
    }
  });
  this._midi.track(0).addEvent({
    message: 'setTempo',
    timestamp: 0,
    parameters: {
      microsecondsPerBeat: util.bpmToTempo(this._tempo)
    }
  });
  this._midi.track(0).addEvent({
    message: 'timeSignature',
    timestamp: 0,
    parameters: util.fromTimeSignature('4/4')
  });
  this._meta = {
    sequenceName: this._midi.track(0).event(0),
    tempo: this._midi.track(0).event(1),
    timeSignature: this._midi.track(0).event(2)
  };
}

MIDISequence.prototype.countBeats = function() {
  return Math.ceil(getLargestTickCount(this) / this.ticksPerBeat());
};

function getLargestTickCount(midi) {
  return midi.usedChannels()
    .map(function(ch) {
      var ticks = 0;
      for (var i = 0; i < ch.countEvents(); i += 1) {
        ticks += ch.event(i).timestamp;
      }
      return ticks;
    })
    .reduce(function(previous, current) {
      return Math.max(previous, current);
    }, 0);
}

MIDISequence.prototype.getTempo = function() {
  return this._tempo;
};

MIDISequence.prototype.beatLength = function() {
  return (60000 / this._tempo);
};

MIDISequence.prototype.ticksPerBeat = function() {
  return this._midi.getTiming().ticksPerBeat;
};

MIDISequence.prototype.setTempo = function(bpm) {
  this._tempo = bpm;
  this._meta.tempo.parameters.microsecondsPerBeat = util.bpmToTempo(
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
  this._meta.timeSignature.parameters = util.fromTimeSignature(
    ts);
};

MIDISequence.prototype.getName = function() {
  return this._meta.sequenceName.parameters.value;
};

MIDISequence.prototype.setName = function(name) {
  this._meta.sequenceName.parameters.value = name;
};


MIDISequence.prototype.usedChannels = function() {
  var used = [];
  for (var i = 0; i < 16; i += 1) {
    if (this._channels[i]) {
      used.push(this.channel(i));
    }
  }
  return used;
};


MIDISequence.prototype.channel = function(n) {
  if (!this._channels[n]) {
    var trackCount = this._midi.countTracks();
    this._midi.addTrack();
    this._channels[n] = new MIDIChannel(this._midi.track(trackCount), n,
      this);
  }
  return this._channels[n];
};

MIDISequence.prototype.toFile = function() {
  this.usedChannels().forEach(function(ch) {
    ch.addEvent(0, 'endOfTrack', {});
  });
  return this._midi;
};

function MIDIChannel(t, n, s) {
  this._track = t;
  this._number = n;
  this._sequence = s;
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
    program: 1,
  });
  this._track.addEvent({
    timestamp: 0,
    message: 'sequenceTrackName',
    parameters: {
      value: 'Untitled Track'
    }
  });
  this._meta = {
    instrumentName: this._track.event(1),
    program: this._track.event(2),
    trackName: this._track.event(3)
  };
}

MIDIChannel.prototype.setName = function(name) {
  this._meta.trackName.parameters.value = name;
};

MIDIChannel.prototype.getName = function() {
  return this._meta.trackName.parameters.value;
};

MIDIChannel.prototype.setInstrument = function(name) {
  this._meta.instrumentName.parameters.value = name;
  this._meta.program.parameters.program = data.GeneralMIDI.byName[
    name];
  // TODO: Use replace event
};

MIDIChannel.prototype.getInstrument = function() {
  return this._meta.instrumentName.parameters.value;
};

MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
  var spec = data.typeMap[msg];
  var evt = {
    timestamp: delta,
    channel: this._number,
    message: spec.message,
    parameters: parameters
  };

  this._track.addEvent(evt);
};

MIDIChannel.prototype.countEvents = function() {
  return this._track.countEvents();
};

MIDIChannel.prototype.event = function(index) {
  // TODO: Translation for parameters, etc.
  return this._track.event(index);
};

MIDIChannel.prototype.number = function() {
  return this._number;
};

MIDIChannel.prototype.eventsInBeat = function(beatIndex) {
  // TODO: Translation for parameters, etc.
  var startTick = this._sequence.ticksPerBeat() * beatIndex;
  var endTick = startTick + this._sequence.ticksPerBeat();
  var currentTick = 0;
  var events = [];

  for (var i = 0, n = this.countEvents(); i < n; i += 1) {
    currentTick += this.event(i).timestamp;
    if (startTick <= currentTick && currentTick <= endTick && this.event(
        i).kind === 'channel') {
      events.push(this.event(i));
    }
  }
  return events;
};

module.exports = MIDISequence;

},{"./MIDIFile":3,"./data":6,"./errors":7,"./util":15}],5:[function(require,module,exports){
'use strict';
var data = require('./data');
function MIDITrack(n) {
  this._number = n;
  this._events = [];
  this._eventTypes = {};
}

MIDITrack.prototype.event = function(i) {
  return this._events[i];
};

MIDITrack.prototype.addEvent = function(evt) {
  var spec = data.typeMap[evt.message];
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

module.exports = MIDITrack;

},{"./data":6}],6:[function(require,module,exports){
module.exports=require(1)
},{"/Users/rick/Projects/midi/midiclassjs/js/Data/index.js":1}],7:[function(require,module,exports){
module.exports=require(2)
},{"/Users/rick/Projects/midi/midiclassjs/js/Errors/index.js":2}],8:[function(require,module,exports){
'use strict';

var errors = require('../Errors');
var data = require('../Data');
var BinaryBuffer = require('./buffer');

module.exports = exportBinary;

function exportBinary(midi) {
  var b = new BinaryBuffer();
  var header = generateFileHeader(midi, b);
  var tracks = generateTracks(midi);
  b.append(header).append(tracks);
  return b.toString();
}

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
  var statusByte = (data.typeToBinary[evt.message] << 4) | evt.channel;
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
  buffer.appendInt8(data.typeToBinary[evt.message]);
  var info = data.typeMap[evt.message];
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


},{"../Data":1,"../Errors":2,"./buffer":9}],9:[function(require,module,exports){
'use strict';

module.exports = BinaryBuffer;

// used to simplify binary operations
function BinaryBuffer(n) {
  n = (n ? n : 0);
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

},{}],10:[function(require,module,exports){
'use strict';

exports.binary = require('./binary');

},{"./binary":8}],11:[function(require,module,exports){
'use strict';

var errors = require('../Errors');
var data = require('../Data');

module.exports = importBinary;

var MIN_HEADER_LENGTH = 14;
var HEADER_PRELUDE = 'MThd';
var TRACK_PRELUDE = 'MTrk';

/*!
 * @param {Array} bytes - the byte array representing the binary file
 * @return {MIDIFile} - the MIDIFile representation of the binary file
 */

function importBinary(m, bytes) {
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
    throw errors.Import.FileSize;
  }

  // sanity check: Any MIDI file must begin with the `MTrk` constant.
  parseStringConstant(bytes, HEADER_PRELUDE, errors.Import.HeaderPrelude);
  var headerSize = parseHeaderSize(bytes);
  var midiType = parseType(bytes);
  var trackCount = parseInteger(bytes, 2);
  var timing = parseTimeDivision(bytes);

  // sanity check: a Type-0 file that declares multiple tracks
  // is just asking for trouble; we fail appropriately
  if (midiType === 0 && trackCount !== 1) {
    throw errors.Import.Type0MultiTrack;
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
 * @throws errors.Import.HeaderSize if size declaration and
 *         file size do not agree
 */

function parseHeaderSize(bytes) {
  var size = parseInteger(bytes, 4);
  if (bytes.length < size) {
    throw errors.Import.HeaderSize;
  } else {
    return size;
  }
}


/*!
 * Returns the MIDI file type,
 * if and only if the type is in {0, 1}.
 *
 * @throws errors.Import.Type if the type is not 0 or 1
 */

function parseType(bytes) {
  var type = parseInteger(bytes, 2);
  if (type !== 0 && type !== 1) {
    throw errors.Import.Type;
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
 * @throws errors.Import.TrackPrelude
 * @throws errors.Import.TrackSize
 * @throws errors.Import.TrackFooter
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
    throw errors.Import.TrackFooter;
  }
}


/*!
 * @throws {MIDITools.Errors.Import.TrackPrelude} if the track declaration
 *         does not appear or is invalid
 * @throws {MIDITools.Errors.Import.TrackLength} if size declaration
 *         is greater than remaining file size
 */

function parseTrackHeader(track, bytes) {
  parseStringConstant(bytes, TRACK_PRELUDE, errors.Import.TrackPrelude);
  var size = parseInteger(bytes, 4);
  if (bytes.length < size) {
    throw errors.Import.TrackLength;
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
 * @throws errors.Import.MessageType if the message type
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
    throw errors.Import.MessageType;
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
  var spec = data.binaryMap[type];

  evt.kind = spec.kind;
  evt.message = spec.message;
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
  var spec = data.binaryMap[type];

  if (!spec) {
    throw errors.Import.MetaType;
  }
  // TODO: compare length and throw error

  evt.kind = spec.kind;
  evt.message = spec.message;
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

  evt.kind = data.binaryMap[evt.status].kind;
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



},{"../Data":1,"../Errors":2}],12:[function(require,module,exports){
'use strict';

exports.binary = require('./binary');
exports.text = require('./text');

},{"./binary":11,"./text":13}],13:[function(require,module,exports){
'use strict';

var errors = require('../Errors');
var data = require('../Data');

module.exports = importText;


var matches = {};

Object.defineProperty(matches, 'NEWLINE', {
  value: /[\r\n]+/,
  writable: false
});
Object.defineProperty(matches, 'WHITESPACE', {
  value: /\s+/,
  writable: false
});

var strings = {
  'HEADER_PRELUDE': 'MFile',
  'TRACK_START_MARKER': 'MTrk',
  'TRACK_END_MARKER': 'TrkEnd'
};


function importText(midi, text) {
  var lines = text.split(matches.NEWLINE).map(function(s) {
    return s.trim();
  });

  var header = lines.shift();
  parseHeader(midi, header);

  var trackLines = splitTracks(lines);
  if (trackLines.length < midi.countTracks()) {
    throw errors.Import.TracksMissing;
  }
  trackLines.forEach(function(tl, index) {
    parseTrack(midi.track(index), tl);
  }.bind(midi));
  return midi;
}

function parseTrack(track, lines) {
  var trackHeader = lines.shift();

  if (trackHeader !== strings.TRACK_START_MARKER) {
    throw errors.Import.TrackPrelude;
  }

  lines.forEach(function(line) {
    parseEvent(track, line);
  });
}

function parseEvent(track, text) {
  var pieces = text.split(matches.WHITESPACE);

  var delta = parseInt(pieces.shift());
  if (pieces.length < 1 || isNaN(delta)) {
    throw errors.Import.DeltaInvalid;
  }

  var type = extractType(pieces);

  if (type === undefined) {
    throw errors.Import.MessageType;
  }

  var msg = parseMessage(type, pieces);

  track.addEvent({
    timestamp: delta,
    message: type.message,
    parameters: msg.parameters
  });
}

function parseMessage(spec, pieces) {
  switch (spec.kind) {
    case 'channel':
      return parseChannelMessage(spec, pieces);
    case 'meta':
      return parseMetaMessage(spec, pieces);
    case 'sysex':
      return parseSysExMessage(spec, pieces);
    default:
      throw errors.Import.MessageType;
  }
}

function parseChannelMessage(spec, pieces) {
  return spec;
}

function parseMetaMessage(spec, pieces) {
  return spec;
}

function parseSysExMessage(spec, pieces) {
  return spec;
}

function extractType(pieces) {
  var typeName = pieces.shift();
  if (typeName === 'Meta') {
    typeName += ' ' + pieces.shift();
  }

  return data.textMap[typeName];
}

function splitTracks(lines) {
  var lastIndex = 0;
  var result = [];
  lines.forEach(function(line, index) {
    if (line === strings.TRACK_END_MARKER) {
      result.push(lines.slice(lastIndex, index));
    }
  });
  return result;
}

function parseHeader(midi, text) {
  var pieces = text.split(matches.WHITESPACE);

  var declaredType = parseInt(pieces[1]);
  var trackCount = parseInt(pieces[2]);

  if (pieces[0] !== strings.HEADER_PRELUDE) {
    throw errors.Import.HeaderPrelude;
  }

  addDeclaredTracks(midi, trackCount);

  // TODO: SMPTE timing
  //<division> is either a positive number (giving the time resolution in
  //clicks per quarter note) or a negative number followed by a positive
  //number (giving SMPTE timing)

  midi.setTiming(parseInt(pieces[3]));
}

function verifyDeclaredType(midi, declaredType) {
  if (isNaN(declaredType)) {
    throw errors.Import.Type;
  }

  if (midi.type() !== declaredType) {
    if (midi.type() === 0) {
      // TODO: either change API to have setType() or dont put
      // this method on the MF instance
      midi._type = 1;
    } else {
      throw errors.Import.Type0MultiTrack;
    }
  }
}
function addDeclaredTracks(midi, trackCount) {
  if (isNaN(trackCount) || trackCount < 0) {
    throw errors.Import.TrackCount;
  }
  try {
    for (var i = 0; i < trackCount; i += 1) {
      midi.addTrack();
    }
  } catch (err) {
    if (err === errors.MIDI.TrackOverflow) {
      throw errors.Import.TrackCount;
    } else {
      throw err;
    }
  }

}



},{"../Data":1,"../Errors":2}],14:[function(require,module,exports){

exports.MIDIFile = require('./MIDIFile');
exports.MIDISequence = require('./MIDISequence');
exports.Errors = require('./errors');
exports.Data = require('./data');
exports.Utils = require('./util');


window.MIDITools = module.exports;


},{"./MIDIFile":3,"./MIDISequence":4,"./data":6,"./errors":7,"./util":15}],15:[function(require,module,exports){
var errors = require('../errors');
var data = require('../data');

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
  var spec = data.textMap[pieces.shift()];
  if (!spec) {
    throw errors.Text.MessageType;
  }

  var evt = {
    kind: spec.kind,
    message: spec.type,
    parameters: {}
  };
  spec.parameters.forEach(function(p, index) {
    if (p.length === 'variable') {
      evt.parameters.value = pieces.join(' ');
    }
    if (p.importers && p.importers.text) {
      p.importers.text(pieces, evt.parameters);
    } else {
      evt.parameters[p.name] = valueParsers[p.valueType](pieces);
    }
  });

  return evt;
}
exports.stringToBytes= stringToBytes;
exports.textToEvent= textToEvent;
exports.bpmToTempo= bpmToTempo;
exports.fromTimeSignature= fromTimeSignature;



},{"../data":6,"../errors":7}]},{},[14]);
