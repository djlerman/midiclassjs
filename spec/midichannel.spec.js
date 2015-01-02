var mt = require('../js/index');
var errors = require('../js/errors');

describe('MIDIChannel', function() {
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
  }); // getName

  describe('setName', function() {
    it('should set channel name properly', function() {
      var midi = new mt.createSequence();
      midi.channel(0).setName('test channel');
      expect(midi.channel(0).getName()).toBe('test channel');
    });
  }); // setName


  describe('getInstrument', function() {
    it('should return 0 for any channel by default', function() {
      var midi = new mt.createSequence();
      expect(midi.channel(0).getInstrument()).toBe(0);
      expect(midi.channel(7).getInstrument()).toBe(0);
    });
  }); // getInstrument

  describe('setInstrument', function() {
    it('should set instrument ID properly', function() {
      var midi = new mt.createSequence();
      var ch = midi.channel(0);
      ch.setInstrument(88);
      var evt = ch.toTrack().filterEvents('programChange')[0];
      expect(evt.parameters.program).toBe(88);
      
    });
    it('should throw error on invalid ID', function() {
      expect(function() {
        var midi = new mt.createSequence();
        var ch = midi.channel(0);
        ch.setInstrument(128);
      }).toThrow(errors.general.instrumentRange);
    });
  }); // setInstrument
});
