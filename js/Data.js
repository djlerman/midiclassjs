window.MIDITools.Data = (function() {
  'use strict';

  var eventMap = {
    noteOff: {
      kind: 'channel',
      type: 'noteOff',
      parameters: ['note', 'velocity'],
      formats: {
        binary: 0x08
      }
    },

    noteOn: {
      kind: 'channel',
      type: 'noteOn',
      parameters: ['note', 'velocity'],
      formats: {
        binary: 0x09
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
        bytes: 2
      }],
      formats: {
        binary: 0x00
      }
    },

    text: {
      kind: 'meta',
      type: 'text',
      name: 'Text',
      length: 'variable',
      formats: {
        binary: 0x01
      }
    },

    copyrightNotice: {
      kind: 'meta',
      type: 'copyrightNotice',
      name: 'Copyright Notice',
      length: 'variable',
      formats: {
        binary: 0x02
      }
    },

    sequenceTrackName: {
      kind: 'meta',
      type: 'sequenceTrackName',
      name: 'Sequence/Track Name',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x03
      }
    },

    instrumentName: {
      kind: 'meta',
      type: 'instrumentName',
      name: 'Instrument Name',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x04
      }
    },

    lyrics: {
      kind: 'meta',
      type: 'lyrics',
      name: 'Lyrics',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x05
      }
    },

    marker: {
      kind: 'meta',
      type: 'marker',
      name: 'Marker',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x06
      }
    },

    cuePoint: {
      kind: 'meta',
      type: 'cuePoint',
      name: 'Cue Point',
      length: 'variable',
      valueType: 'string',
      formats: {
        binary: 0x07
      }
    },

    midiChannelPrefix: {
      kind: 'meta',
      type: 'midiChannelPrefix',
      name: 'MIDI Channel Prefix',
      length: 1,
      parameters: [{
        name: 'value',
        bytes: 1
      }],
      formats: {
        binary: 0x20
      }
    },

    midiPort: {
      kind: 'meta',
      type: 'midiPort',
      name: 'MIDI Port',
      length: 1,
      parameters: [{
        name: 'port',
        bytes: 1
      }],
      formats: {
        binary: 0x21
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
        bytes: 3
      }],
      formats: {
        binary: 0x51
      }
    },

    smpteOffset: {
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
    },

    timeSignature: {
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
    },

    keySignature: {
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
    typeToBinary: {}
  };

  Object.keys(eventMap).forEach(function(k) {
    var val = eventMap[k];
    data.binaryMap[val.formats.binary] = val;
    data.typeMap[k] = val;
    data.typeToBinary[k] = val.formats.binary;
  });

  return data;
}());
