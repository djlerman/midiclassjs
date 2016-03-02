var mt = require('../js/index');
var errors = require('../js/errors');

describe('MIDISequence', function() {
  var midi;

  beforeEach(function() {
    midi = new mt.createSequence();
  });

  describe('countBeats', function() {
    it('should return 0 for an empty sequence', function() {
      expect(midi.countBeats()).toBe(0);
    });

    it('should return 1 for a single beat', function() {
      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });
      midi.channel(0).addEvent(95, 'noteOff', {
        note: 0x3C,
        velocity: 0x60
      });
      expect(midi.countBeats()).toBe(1);
    });

    it('should correctly count a several-beat passage', function() {
      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });
      midi.channel(0).addEvent(95, 'noteOff', {
        note: 0x3C,
        velocity: 0x60
      });
      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });
      midi.channel(0).addEvent(95, 'noteOff', {
        note: 0x3C,
        velocity: 0x60
      });

      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });
      midi.channel(0).addEvent(95, 'noteOff', {
        note: 0x3C,
        velocity: 0x60
      });
      expect(midi.countBeats()).toBe(3);
    });

    it('should correctly count beats given overlapping notes', function() {
      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });

      midi.channel(0).addEvent(95, 'noteOff', {
        note: 0x3C,
        velocity: 0x60
      });

      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });
      midi.channel(0).addEvent(95, 'noteOff', {
        note: 0x3C,
        velocity: 0x60
      });

      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });
      midi.channel(0).addEvent(180, 'noteOff', {
        note: 0x3C,
        velocity: 0x60
      });
      expect(midi.countBeats()).toBe(4);
    });
  }); // countBeats

  describe('channel', function() {
    it('should return channel i, given number i= 0--15', function() {
      for (var i = 0, n = 15; i < n; i += 1) {
        expect(midi.channel(i).number()).toBe(i);
      }
    });

    it('should throw an error for i < 0', function() {
            expect(function() {
        midi.channel(-1);
      }).toThrow(errors.general.channelRange);
    });

    it('should throw an error for i > 15', function() {
            expect(function() {
        midi.channel(16);
      }).toThrow(errors.general.channelRange);
    });

    it('should return channels which are on distinct tracks', function() {
      var channels = [];
      for (var i = 0, n = 15; i < n; i += 1) {
        channels.push(midi.channel(i));
      }

      for (i = 0, n = 15; i < n; i += 1) {
        expectDistinctTracks(i, channels);
      }

      function expectDistinctTracks(i, channels) {
        var ch = channels[i];
        var others =
            channels.slice(0, i).concat(channels.slice(i + 1));
        others.forEach(function(o) {
          expect(o.toTrack()).not.toBe(ch.toTrack());
        });
      }
    });
  });

  describe('usedChannels', function() {
    it('should return 0 for a newly-initialized MIDISequence', function() {
      expect(midi.usedChannels()).toEqual([]);
    });

    it('should return 1 for sequences with single event', function() {
      midi.channel(0).addEvent(0, 'noteOn', {
        note: 0x3C,
        velocity: 0x60
      });
      expect(midi.usedChannels()).toEqual([midi.channel(0)]);
    });

    it('should return correct value for multi-channel sequences', function() {
      midi.channel(0).addEvent(0, 'noteOn', { note: 0x3C, velocity: 0x60 });
      midi.channel(0).addEvent(95, 'noteOff', { note: 0x3C, velocity: 0x60 });
      midi.channel(1).addEvent(0, 'noteOn', { note: 0x3C, velocity: 0x60 });
      midi.channel(1).addEvent(95, 'noteOff', { note: 0x3C, velocity: 0x60 });
      expect(midi.usedChannels()).toEqual([midi.channel(0), midi.channel(1)]);
    });
  });

  describe('getTempo', function() {
    it('should return 120 for a newly-initialized MIDISequence', function() {
      expect(midi.getTempo()).toEqual(120);
    });

    it('should return previously-set value if sequence tempo set', function() {
      midi.setTempo(240);
      expect(midi.getTempo()).toEqual(240);
    });
  });

  describe('setTempo', function() {
    it('should set values within standard range', function() {
      midi.setTempo(240);
      expect(midi.getTempo()).toEqual(240);
    });

    it('should throw error given 0 value', function() {
      expect(function() {
        midi.setTempo(0);
      }).toThrow(errors.general.tempoRange);
    });

    it('should throw error given negative value', function() {
      expect(function() {
        midi.setTempo(-1);
      }).toThrow(errors.general.tempoRange);
    });

    it('should throw error given value > 60000', function() {
      expect(function() {
        midi.setTempo(60001);
      }).toThrow(errors.general.tempoRange);
    });
  });
});
