var mt = require('../js/index');
var data = require('../js/data');

describe('importBinary', function() {

  /*
   * Header parsing
   */

  it('correctly loads Type-1 MIDI with header only', function() {
    expectLoaded({
      file: 'spec/samples/mid/simple1.mid',
      expects: function(m) {
        expect(m.type()).toBe(1);
        expect(m.getTiming().ticksPerBeat).toBe(128);
        expect(m.countTracks()).toBe(1);
      }
    });
  });

  it('correctly loads MIDI with SMPTE time-division', function() {
    expectLoaded({
      file: 'spec/samples/mid/import-smpte.mid',
      expects: function(m) {
        expect(m.getTiming().framesPerSecond).toBe(25);
        expect(m.getTiming().ticksPerFrame).toBe(40);
      }
    });
  });

  it('throws error on invalid prelude (MThd)', function() {
    expectThrows({
      file: 'spec/samples/mid/err-prelude.mid',
      thrown: mt.errors.import.HeaderPrelude
    });
  });

  it('throws error on invalid header size declaration', function() {
    expectThrows({
      file: 'spec/samples/mid/err-header-size.mid',
      thrown: mt.errors.import.HeaderSize
    });
  });

  it('throws error on midi with declared type of 0 and >1 track)', function() {
    expectThrows({
      file: 'spec/samples/mid/err-type0-multi.mid',
      thrown: mt.errors.import.Type0MultiTrack
    });
  });


  /*
   * Track parsing
   */
  it('throws error on midi with invalid track prelude (MTrk)', function() {
    expectThrows({
      file: 'spec/samples/mid/err-track-prelude.mid',
      thrown: mt.errors.import.TrackPrelude
    });
  });

  it('throws error on midi with missing track footer', function() {
    expectThrows({
      file: 'spec/samples/mid/err-track-footer.mid',
      thrown: mt.errors.import.TrackFooter
    });
  });

  it('correctly parses channel events of a Type-1 MIDI file', function() {
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
    expectLoaded({
      file: 'spec/samples/mid/simple1.mid',
      expects: function(m) {
        this.expect(m.countTracks()).toBe(1);
        this.expect(m.track(0).countEvents()).toBe(events.length);
        var track = m.track(0);
	events.forEach(function(evt, i) {
          this.expect(track.event(i).timestamp).toBe(evt.time);
          this.expect(track.event(i).message).toBe(evt.type);
          Object.keys(evt.parameters).forEach(function(name) {
	    var expect = evt.parameters[name];
            var actual = track.event(i).parameters[name];
            this.expect(expect).toBe(actual);
	  });
	});
      }
    });
  });
  
  it('correctly parses channel events of a Type-0 MIDI file', function() {

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
    expectLoaded({
      file: 'spec/samples/mid/events-type0.mid',
      expects: function(m) {
	this.expect(m.type()).toBe(0);
	this.expect(m.countTracks()).toBe(1);
        this.expect(m.track(0).countEvents()).toBe(events.length);
        var track = m.track(0);
       	events.forEach(function(evt, i) {
          this.expect(track.event(i).timestamp).toBe(evt.time);
          this.expect(track.event(i).message).toBe(evt.type);
          Object.keys(evt.parameters).forEach(function(name) {
	    var expect = evt.parameters[name];
            var actual = track.event(i).parameters[name];
            this.expect(expect).toBe(actual);
	  });
	});
      }
    });
  });

  it('should correctly import a setTempo event', function() {
    expectLoaded({
      file: 'spec/samples/mid/setTempo-type0.mid',
      expects: function(m) {
	var events = m.track(0).filterEvents('setTempo');
	expect(events.length).toBeGreaterThan(0);
      }
    });
  });
  it('should correctly import a pitchWheel event', function() {
    expectLoaded({
      file: 'spec/samples/mid/import-pitchWheel-type1.mid',
      expects: function(m) {
	var events = m.track(0).filterEvents('pitchWheel');

	expect(events[0].parameters.pitchValue).toBe(0x2000);
      }
    });
  });
});

function expectLoaded(opts) {
  var imported = null;
  runs(function() {
    mt.loadMIDIFromFile(opts.file, function(m) {
      imported = m;
    }, function(err) {
      console.log("ERROR");
      console.log(err);
    });
  });

  waitsFor(function() {
    return imported != null;
  }, 1000);

  runs(function() {
    opts.expects.call(this, imported);
  });
}

function expectThrows(opts) {
  var thrown = null;
  runs(function() {
    mt.loadMIDIFromFile(opts.file, function(m) {
      imported = m;
    }, function(err) {
      thrown = err;
    });
  });

  waitsFor(function() {
    return thrown != null;
  }, 1000);

  runs(function() {
    expect(thrown.message).toBe(opts.thrown.message);
  });
}
