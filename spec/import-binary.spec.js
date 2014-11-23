var mt = require('../js/index');
var data = require('../js/data');
var fs = require('fs');

describe('importBinary', function() {
  
  /*
   * Header parsing
   */

  it('correctly loads Type-1 MIDI with header only', function() {
    var file = fs.readFileSync('spec/samples/mid/simple1.mid');
    var m = mt.MIDIFile.fromBinary(file);
    expect(m.type()).toBe(1);
    expect(m.getTiming().ticksPerBeat).toBe(128);
    expect(m.countTracks()).toBe(1);
  });

  it('correctly loads MIDI with SMPTE time-division', function() {

    var file = fs.readFileSync('spec/samples/mid/import-smpte.mid');
    var m = mt.MIDIFile.fromBinary(file);
    expect(m.getTiming().framesPerSecond).toBe(25);
    expect(m.getTiming().ticksPerFrame).toBe(40);
  });

  it('throws error on invalid prelude (MThd)', function() {
    var file = fs.readFileSync('spec/samples/mid/err-prelude.mid');
    expect(function() {
      mt.MIDIFile.fromBinary(file);
    }).toThrow(mt.errors.import.HeaderPrelude);
  });

  it('throws error on invalid header size declaration', function() {
    var file = fs.readFileSync('spec/samples/mid/err-header-size.mid');
    expect(function() {
      var m = mt.MIDIFile.fromBinary(file);
    }).toThrow(mt.errors.import.HeaderSize);
  });

  it('throws error for declared type of 0 and >1 track)', function() {
    var file = fs.readFileSync('spec/samples/mid/err-type0-multi.mid');
    expect(function() {
      var m = mt.MIDIFile.fromBinary(file);
    }).toThrow(mt.errors.import.Type0MultiTrack);
  });


  /*
   * Track parsing
   */
  it('throws error on midi with invalid track prelude (MTrk)',
    function() {
      var file = fs.readFileSync('spec/samples/mid/err-track-prelude.mid');
      expect(function() {
        var m = mt.MIDIFile.fromBinary(file);
      }).toThrow(mt.errors.import.TrackPrelude);
    });

  it('throws error on midi with missing track footer', function() {
    var file = fs.readFileSync(
      'spec/samples/mid/err-track-footer.mid');
    expect(function() {
      var m = mt.MIDIFile.fromBinary(file);
    }).toThrow(mt.errors.import.TrackFooter);
  });

  it('correctly parses channel events of a Type-1 MIDI file',
    function() {
      var types = data.eventTypes;

      var events = [{
        type: types.noteOn,
        time: 0x00,
        parameters: {
          note: 0x3C,
          velocity: 0x60
        }
      }, {
        type: types.noteOn,
        time: 0x80,
        parameters: {
          note: 0x3E,
          velocity: 0x60
        }
      }, {
        type: types.noteOn,
        time: 0x80,
        parameters: {
          note: 0x40,
          velocity: 0x60
        }
      }, {
        type: types.controlChange,
        /* All notes off */
        time: 0x80,
        parameters: {
          controller: 0x7B,
          value: 0
        }
      }, {
        type: types.endOfTrack,
        time: 0x00,
        parameters: {}
      }];
      var file = fs.readFileSync('spec/samples/mid/simple1.mid');
      m = mt.MIDIFile.fromBinary(file);
      this.expect(m.countTracks()).toBe(1);
      this.expect(m.track(0).countEvents()).toBe(events.length);
      var track = m.track(0);
      events.forEach(function(evt, i) {
        expect(track.event(i).timestamp).toBe(
          evt.time);
        expect(track.event(i).message).toBe(evt.type);
        Object.keys(evt.parameters).forEach(function(
          name) {
          var expected = evt.parameters[name];
          var actual = track.event(i).parameters[
            name];
          expect(expected).toBe(actual);
        });
      }, this);
    });

  it('correctly parses channel events of a Type-0 MIDI file',
    function() {

      var types = data.eventTypes;

      var events = [{
        type: types.timeSignature,
        time: 0x00,
        parameters: {
          numerator: 4,
          denominator: 2,
          metronome: 24,
          thirtySeconds: 8
        }
      }, {
        type: types.setTempo,
        time: 0x00,
        parameters: {
          microsecondsPerBeat: 500000
        }
      }, {
        type: types.programChange,
        time: 0x00,
        parameters: {
          program: 5
        }
      }, {
        type: types.programChange,
        time: 0x00,
        parameters: {
          program: 46
        }
      }, {
        type: types.programChange,
        time: 0x00,
        parameters: {
          program: 70
        }
      }, {
        type: types.noteOn,
        time: 0x00,
        parameters: {
          note: 48,
          velocity: 96
        }
      }, {
        type: types.noteOn,
        time: 0x00,
        parameters: {
          note: 60,
          velocity: 96
        }
      }, {
        type: types.noteOn,
        time: 0x60,
        parameters: {
          note: 67,
          velocity: 64
        }
      }, {
        type: types.noteOn,
        time: 0x60,
        parameters: {
          note: 76,
          velocity: 32
        }
      }, {
        type: types.noteOff,
        time: 0xC0,
        parameters: {
          note: 48,
          velocity: 64
        }
      }, {
        type: types.noteOff,
        time: 0x00,
        parameters: {
          note: 60,
          velocity: 64
        }
      }, {
        type: types.noteOff,
        time: 0x00,
        parameters: {
          note: 67,
          velocity: 64
        }
      }, {
        type: types.noteOff,
        time: 0x00,
        parameters: {
          note: 76,
          velocity: 64
        }
      }, {
        type: types.endOfTrack,
        time: 0x00,
        parameters: {}
      }];
      var file = fs.readFileSync('spec/samples/mid/events-type0.mid');
      var m = mt.MIDIFile.fromBinary(file);
      expect(m.type()).toBe(0);
      expect(m.countTracks()).toBe(1);
      expect(m.track(0).countEvents()).toBe(events.length);
      var track = m.track(0);
      events.forEach(function(evt, i) {
        expect(track.event(i).timestamp).toBe(evt.time);
        expect(track.event(i).message).toBe(evt.type);
        Object.keys(evt.parameters).forEach(function(
          name) {
          var expected = evt.parameters[name];
          var actual = track.event(i).parameters[
            name];
          expect(expected).toBe(actual);
        });
      }, this);
    });
  it('should correctly import a setTempo event', function() {
      var file = fs.readFileSync(
        'spec/samples/mid/setTempo-type0.mid');
    var m = mt.MIDIFile.fromBinary(file);
          var events = m.track(0).filterEvents('setTempo');
          expect(events.length).toBeGreaterThan(0);
  });
  it('should correctly import a pitchWheel event', function() {
    var file = fs.readFileSync(
      'spec/samples/mid/import-pitchWheel-type1.mid');
    var m = mt.MIDIFile.fromBinary(file);
    var events = m.track(0).filterEvents('pitchWheel');
    expect(events[0].parameters.pitchValue).toBe(0x2000);
  });
  it('should correctly import an afterTouch event', function() {
    var file = fs.readFileSync('spec/samples/mid/import-afterTouch-type0.mid');
    var m = mt.MIDIFile.fromBinary(file);
    expect(m.track(0).event(0).message).toBe('noteOn');
    expect(m.track(0).event(1).message).toBe('afterTouch');
    expect(m.track(0).event(2).message).toBe('noteOff');
    expect(m.track(0).event(3).message).toBe('endOfTrack');
    var events = m.track(0).filterEvents('afterTouch');
    expect(events[0].parameters.note).toBe(0x3C);
    expect(events[0].parameters.amount).toBe(0x40);
  });

  it('should correctly import a channelPressure event', function() {
    var file = fs.readFileSync(
      'spec/samples/mid/import-channelPressure-type0.mid');
    var m = mt.MIDIFile.fromBinary(file);
    expect(m.track(0).event(0).message).toBe('noteOn');
    expect(m.track(0).event(1).message).toBe(
      'channelPressure');
    expect(m.track(0).event(2).message).toBe('noteOff');
    expect(m.track(0).event(3).message).toBe('endOfTrack');
    var events = m.track(0).filterEvents('channelPressure');
    expect(events[0].parameters.amount).toBe(0x40);
  });
});
