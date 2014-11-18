var mt = require('../js/index');

describe('MIDIFile', function() {

  describe('construction', function() {
    
    it('creates an empty midifile', function() {
      var midi = mt.createMIDI();
      expect(midi.countTracks()).toBe(0);
      expect((midi.getTiming().type)).toBe('ticksPerBeat');
      expect(midi.getTiming().ticksPerBeat).toBe(96);
      expect(midi.type()).toBe(0);
    });

    
    it('creates a Type-1 file when passed valid parameter', function() {
      expect(mt.createMIDI(1).type()).toBe(1);
    });

    
    it('throws error on invalid parameter', function() {
      expect(function() {
        mt.createMIDI(2);
      }).toThrow(mt.errors.midi.type);
    });
  });

  describe('track', function() {
    it('returns track on valid call', function() {
      var midi = mt.createMIDI();
      var track0 = midi.addTrack();
      expect(midi.track(0)).toBe(track0);
    });

   
    it('throws error on invalid call', function() {
      expect(function() {
	mt.createMIDI().track(0);
      }).toThrow(mt.errors.midi.track);
    });
  });

  describe('addTrack', function() {
    it('changes file type to 1 after adding second track', function() {
      var midi = mt.createMIDI();
      midi.addTrack();
      expect(midi.type()).toBe(0);
      midi.addTrack();
      expect(midi.type()).toBe(1);
    });

    it('throws error after adding too many tracks', function() {
      var midi = mt.createMIDI();
      expect(function() {
	for (var i = 0; i < Math.pow(2, 16)+1; i += 1) {
	  midi.addTrack();
	}
      }).toThrow(mt.errors.midi.trackOverflow);
    });
  });

  describe('removeTrack', function() {
    it('removes existing tracks', function() {
      var midi = mt.createMIDI();
      midi.addTrack();
      midi.removeTrack(0);
      expect(midi.countTracks()).toBe(0);
    });
    it('throws error when removing non-existent tracks', function() {
      var midi = mt.createMIDI();
      expect(function() {
	midi.removeTrack(0);
      }).toThrow(mt.errors.midi.removeInvalidTrack);
    });
  });

  describe('setTiming', function() {

    it('throws error on non-numeric literal', function() {
      var midi = mt.createMIDI();
      expect(function() {
	midi.setTiming('120');
      }).toThrow(mt.errors.midi.setTiming);
    });

    it('throws error on object with incorrect parameters', function() {
      var midi = mt.createMIDI();
      expect(function() {
	midi.setTiming({
	  framesPerSecond: 25,
	  invalid: 40
	});
      }).toThrow(mt.errors.midi.setTiming);
    });

    it('sets type to ticksPerBeat for numeric literal', function() {
      var midi = mt.createMIDI();
      midi.setTiming(120);
      expect(midi.getTiming().type).toBe('ticksPerBeat');
      expect(midi.getTiming().ticksPerBeat).toBe(120);
    });

    it('sets type to framesPerSecond', function() {
      var midi = mt.createMIDI();
      midi.setTiming({
	framesPerSecond: 25,
	ticksPerFrame: 40
      });
      
      expect(midi.getTiming().type).toBe('framesPerSecond');
      expect(midi.getTiming().framesPerSecond).toBe(25);
      expect(midi.getTiming().ticksPerFrame).toBe(40);
    });
  });
});
