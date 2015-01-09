var MIDITrack = require('../js/MIDITrack');
var data = require('../js/data');
var errors = require('../js/errors');

describe('MIDITrack', function() {
  describe('addEvent', function() {
    it ('should add an event to the track', function() {
      var t = new MIDITrack();
      expect(t.countEvents()).toBe(0);
      t.addEvent({
        message: 'noteOn',
        channel: 0,
        timestamp: 0,
        parameters: {
          note: 0x60,
          velocity: 0x60
        }
      });
      expect(t.countEvents()).toBe(1);
    });
    
    it ('should correctly add properties to evt.parameters', function() {
      var t = new MIDITrack();
      expect(t.countEvents()).toBe(0);
      t.addEvent({
        message: 'noteOn',
        channel: 0,
        timestamp: 0,
        parameters: {
          note: 0x60,
          velocity: 0x70
        }
      });
      expect(t.event(0).parameters[0]).toBe(0x60);
      expect(t.event(0).parameters[1]).toBe(0x70);
    });
    
    it ('should add new events to end of track', function() {
      var t = new MIDITrack();
      expect(t.countEvents()).toBe(0);
      t.addEvent({
        message: 'noteOn',
        channel: 0,
        timestamp: 0,
        parameters: {
          note: 0x60,
          velocity: 0x70
        }
      });
      t.addEvent({
        message: 'noteOff',
        channel: 0,
        timestamp: 0,
        parameters: {
          note: 0x60,
          velocity: 0x70
        }
      });

      expect(t.event(0).message).toBe('noteOn');
      expect(t.event(1).message).toBe('noteOff');
    });
    
    it ('should throw error on invalid event message', function() {
      var t = new MIDITrack();
      expect(function() {
        t.addEvent({
          message: 'noteOne',  // misspelled
          channel: 0,
          timestamp: 0,
          parameters: {
            note: 0x60,
            velocity: 0x70
          }
        });
      }).toThrow(errors.track.invalidMessage);
    });
    
    it ('should throw error on missing event parameter', function() {
      var t = new MIDITrack();
      expect(function() {
        t.addEvent({
          message: 'noteOn',
          channel: 0,
          timestamp: 0,
          parameters: {
            noted: 0x60,    // misspelled
            velocity: 0x70
          }
        });
      }).toThrow(errors.track.parameterMissing);
    });
  });
  
  describe('replaceEvent', function() {
    it ('should replace existing event', function() {
      var t = new MIDITrack();
      expect(t.countEvents()).toBe(0);
      t.addEvent({
        message: 'noteOn',
        channel: 0,
        timestamp: 0,
        parameters: {
          note: 0x60,
          velocity: 0x70
        }
      });
      t.addEvent({
        message: 'controlChange',
        channel: 0,
        timestamp: 20,
        parameters: {
          controller: data.controllers.VOLUME,
          value: 0xF0
        }
      });
      t.addEvent({
        message: 'noteOff',
        channel: 0,
        timestamp: 20,
        parameters: {
          note: 0x60,
          velocity: 0x70
        }
      });
      t.replaceEvent(1, {
        message: 'controlChange',
        channel: 0,
        timestamp: 20,
        parameters: {
          controller: data.controllers.VOLUME,
          value: 0x20
        }
      });
      expect(t.event(1).parameters.value).toBe(0x20);
    });
    it ('should leave track unmodified when an error occurs', function() {
      var t = new MIDITrack();
      t.addEvent({
        message: 'noteOn',
        channel: 0,
        timestamp: 0,
        parameters: {
          note: 0x60,
          velocity: 0x70
        }
      });
      t.addEvent({
        message: 'controlChange',
        channel: 0,
        timestamp: 20,
        parameters: {
          controller: data.controllers.VOLUME,
          value: 0xF0
        }
      });
      t.addEvent({
        message: 'noteOff',
        channel: 0,
        timestamp: 20,
        parameters: {
          note: 0x60,
          velocity: 0x70
        }
      });
      expect(function() {
        t.replaceEvent(1, {
          message: 'controlChanged',  // misspelled
          channel: 0,
          timestamp: 20,
          parameters: {
            controller: data.controllers.VOLUME,
            value: 0x20
          }
        });
      }).toThrow(errors.track.invalidMessage);
      expect(t.countEvents()).toBe(3);
      expect(t.event(1).parameters.value).toBe(0xF0);
    });
  });
});
