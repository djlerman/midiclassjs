var mt = require('../js/index');
var errors = require('../js/errors');

describe('MIDIChannel', function() {
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

  describe('getVolume', function() {
    it('should return 64 for an empty sequence', function() {
      var midi = new mt.createSequence();
      expect(midi.channel(0).getVolume()).toBe(64);
    });
  }); // getVolume

  describe('setVolume', function() {
    it('should set volume value on valid call', function() {
      var midi = new mt.createSequence();
      midi.channel(0).setVolume(100);
      expect(midi.channel(0).getVolume()).toBe(100);
    });

    it('should result in a different track value', function() {
      var midi = new mt.createSequence();
      midi.channel(0).setVolume(100);
      var evt = midi.channel(0).toTrack().filterEvents(
        'controlChange')[0];
      expect(evt.parameters.value).toBe(100);
    });

    it('should throw exception for values outside 0 - 127', function() {
      var ch = new mt.createSequence().channel(0);
      expect(function() {
        ch.setVolume(-1);
      }).toThrow(errors.general.volumeRange);
      expect(function() {
        ch.setVolume(128);
      }).toThrow(errors.general.volumeRange);      
    }); // setVolume
  });
  
  describe('getName', function() {
    it('should return channelN for channelN by default', function() {
      var midi = new mt.createSequence();
      expect(midi.channel(0).getName()).toBe('channel0');
      expect(midi.channel(7).getName()).toBe('channel7');
    });
  }); // getVolume

});
