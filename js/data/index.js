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
      name: 'pitchValue',
      length: 2,
      importers: {
        binary: function(value, params) {
          var removed = (value & 0x7F7F);
          var top = ((removed & 0xFF00) >> 1);
          var bottom = (removed & 0x00FF) >> 1;
          params.pitchValue = (top + bottom);
        }
      }
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
    valueType: 'string',
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
    valueType: 'string',
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
