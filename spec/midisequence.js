var mt = require('../js/index');
var errors = require('../js/errors');

describe('MIDISequence', function() {
  describe('countBeats', function() {
    it('should return 0 for an empty sequence', function() {
      var midi = new mt.createSequence();
      expect(midi.countBeats()).toBe(0);
    });

    it('should return 1 for a single beat', function() {
      var midi = new mt.createSequence();
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
      var midi = new mt.createSequence();

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
      var midi = new mt.createSequence();
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
        expect(midi.channel(i).number().toBe(i));
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
        expectDistinctTracks(channels);
      }
      
      function expectDistinctTracks(i, channels) {
        var ch = channels[i];
        var others =
              channels.slice(0, i).concat(channels.slice(i + 1));
        others.forEach(function(o) {
          expect(!o.toTrack()).toBe(ch.toTrack());
        });
      }
    });
  });

}); // MIDISequence
