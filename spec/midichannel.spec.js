var mt = require('../js/index');
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
  });
});
