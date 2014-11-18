QUnit.module("MIDIFile~importBinary");

/*
 * Header parsing
 */

QUnit.asyncTest("header of small Type-1 MIDI", function(assert) {
  MIDITools.MIDIFile.importBinary('samples/mid/simple1.mid', function(m) {
    QUnit.start();
    assert.equal(m.type(), 1);
    assert.equal(m.getTiming().ticksPerBeat, 128);
    assert.equal(m.countTracks(), 1);
    window.s = m;
  }, function(err) {
    QUnit.start();
    assert.ok(false, 'Import should not result in error');
  });
});

QUnit.asyncTest("import MIDI with invalid prelude", function(assert) {
  MIDITools.MIDIFile.importBinary('samples/mid/err-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    },
    function(err) {
      QUnit.start();
      assert.ok(err === MIDITools.Errors.Import.HeaderPrelude);
    });
});

QUnit.asyncTest("import MIDI with header size > file size", function(assert) {
  MIDITools.MIDIFile.importBinary('samples/mid/err-header-size.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    },
    function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.HeaderSize);
    });
});

QUnit.asyncTest("import Type-0 MIDI with track count > 1", function(assert) {
  MIDITools.MIDIFile.importBinary('samples/mid/err-type0-multi.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    },
    function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.Type0MultiTrack);
    });
});

QUnit.asyncTest("import MIDI with invalid prelude", function(assert) {
  MIDITools.MIDIFile.importBinary('samples/mid/err-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    },
    function(err) {
      QUnit.start();
      assert.ok(err === MIDITools.Errors.Import.HeaderPrelude);
    });
});

QUnit.asyncTest("import MIDI with SMPTE time-divison", function(assert) {
  MIDITools.MIDIFile.importBinary('samples/mid/import-smpte.mid',
    function(m) {
      QUnit.start();
      assert.ok(m.getTiming().type = 'framesPerSecond');
      assert.equal(m.getTiming().framesPerSecond, 25);
      assert.equal(m.getTiming().ticksPerFrame, 40);
    },
    function(err) {
      QUnit.start();
      assert.ok(false, 'Import should not result in error');
    });
});

/*
 * Track parsing
 */

QUnit.asyncTest("import Type-0 MIDI with invalid track prelude", function(
  assert) {
  MIDITools.MIDIFile.importBinary(
    'samples/mid/err-track-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    },
    function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.TrackPrelude);
    });
});

QUnit.asyncTest("import Type-0 MIDI with missing track footer", function(assert) {
  MIDITools.MIDIFile.importBinary(
    'samples/mid/err-track-footer.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    },
    function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.TrackFooter);
    });
});


QUnit.asyncTest("channel events - Type-1 MIDI", function(assert) {

  var types = MIDITools.Data.eventTypes;

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
  MIDITools.MIDIFile.importBinary('samples/mid/simple1.mid',
    function(m) {
      QUnit.start();
      assert.equal(m.countTracks(), 1);
      assert.equal(m.track(0).countEvents(), events.length);
      var track = m.track(0);
      for (var i = 0, n1 = events.length; i < n1; i++) {
        assert.equal(track.event(i).timestamp, events[i].time, 'msg: ' +
          i);
        assert.equal(track.event(i).message, events[i].type, 'msg: ' + i);
        var names = Object.keys(events[i].parameters);
        for (var j = 0, n2 = names.length; j < n2; j += 1) {
          var expect = events[i].parameters[name];
          var actual = track.event(i).parameters[name];
          assert.equal(expect, actual, 'msg: ' + i + '| param: ' + name);
        }
      }
    },
    function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.TrackFooter);
    });
});

/*
 * Event parsing
 */
QUnit.asyncTest("events of simple Type-0 MIDI", function(assert) {

  var types = MIDITools.Data.eventTypes;

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

  MIDITools.MIDIFile.importBinary('samples/mid/events-type0.mid',
    function(m) {
      QUnit.start();
      assert.equal(m.countTracks(), 1);
      assert.equal(m.track(0).countEvents(), events.length);
      for (var i = 0, n = events.length; i < n; i += 1) {
        var track = m.track(0);
        assert.equal(track.event(i).timestamp, events[i].time, 'msg: ' +
          i);
        assert.equal(track.event(i).message, events[i].type, 'msg: ' + i);
        var names = Object.keys(events[i].parameters);
        for (var j = 0, n2 = names.length; j < n2; j += 1) {
          var name = names[j];
          var expect = events[i].parameters[name];
          var actual = track.event(i).parameters[name];
          assert.equal(actual, expect, 'msg: ' + i + '| param: ' + name);
        }
      }
    },
    function(err) {
      QUnit.start();
      assert.ok(false, 'Import should not result in error');
      console.log(err);
    });
});

QUnit.asyncTest("import with setTempo event - type 0", function(assert) {
  MIDITools.MIDIFile.importBinary('samples/mid/setTempo-type0.mid',
    function(m) {
      QUnit.start();
      var events = m.track(0).filterEvents('setTempo');
      assert.ok(events.length > 0);
    },
    function(err) {
      QUnit.start();
      assert.ok(false, 'Import should not result in error');
      console.log(err);
    });
});