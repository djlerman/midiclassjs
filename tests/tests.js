QUnit.test("library load", function(assert) {
  assert.ok(MIDITools, "library loaded!");
});

/*
 * Header parsing
 */
QUnit.asyncTest("import simple Type-1 MIDI", function(assert) {
  MIDITools.importBinary('samples/mid/simple1.mid', function(m) {
    QUnit.start();
    assert.equal(m.type, 1);
    assert.equal(m.timing.ticksPerBeat, 128);
    assert.equal(m.tracks.length, 1);
    window.s = m;
  }, function(err) {
    QUnit.start();
    assert.ok(false, 'Import should not result in error');
  });
});

QUnit.asyncTest("import MIDI with invalid prelude", function(assert) {
  MIDITools.importBinary('samples/mid/err-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.ok(err === MIDITools.Errors.Import.HeaderPrelude);
    });
});

QUnit.asyncTest("import MIDI with header size > file size", function(assert) {
  MIDITools.importBinary('samples/mid/err-header-size.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.HeaderSize);
    });
});

QUnit.asyncTest("import MIDI with SMPTE time-divison", function(assert) {
  MIDITools.importBinary('samples/mid/import-smpte.mid',
    function(m) {
      QUnit.start();
      assert.ok(m.timing.type = "ticksPerBeat");
      assert.equal(m.timing.framesPerSecond, 25);
      assert.equal(m.timing.ticksPerFrame, 40);
    }, function(err) {
      QUnit.start();
      assert.ok(false, 'Import should not result in error');
    });
});

QUnit.asyncTest("import Type-0 MIDI with track count > 1", function(assert) {
  MIDITools.importBinary('samples/mid/err-type0-multi.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.Type0MultiTrack);
    });
});

QUnit.asyncTest("import MIDI with invalid prelude", function(assert) {
  MIDITools.importBinary('samples/mid/err-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.ok(err === MIDITools.Errors.Import.HeaderPrelude);
    });
});

/*
 * Track parsing
 */

QUnit.asyncTest("import Type-0 MIDI with invalid track prelude", function(
  assert) {
  MIDITools.importBinary('samples/mid/err-track-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.TrackPrelude);
    });
});

QUnit.asyncTest("import Type-0 MIDI with missing track footer", function(
  assert) {
  MIDITools.importBinary('samples/mid/err-track-footer.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Import.TrackFooter);
    });
});


QUnit.asyncTest("channel events of simple Type-1 MIDI", function(assert) {

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
  MIDITools.importBinary('samples/mid/simple1.mid',
    function(m) {
      QUnit.start();
      assert.equal(m.tracks.length, 1);
      assert.equal(m.tracks[0].events.length, events.length);
      var trackEvents = m.tracks[0].events;
      
      for (var i = 0, n1 = events.length; i < n1; i++) {
        assert.equal(trackEvents[i].timestamp, events[i].time, 'msg: ' + i);
        assert.equal(trackEvents[i].message.type, events[i].type, 'msg: ' + i);
        var names = Object.keys(events[i].parameters);
        for (var j = 0, n2 = names.length; j < n2; j += 1) {
          var expect = events[i].parameters[name];
          var actual = trackEvents[i].message.parameters[name];
          assert.equal(expect, actual, 'msg: ' + i + '| param: ' + name);
        }
      }
    }, function(err) {
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
      denominator: 4
    }
  }, {
    type: types.setTempo,
    time: 0x00,
    parameters: {
      microsecondsPerBeat: '120'
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
    parameters: {}
  }, {
    type: types.programChange,
    time: 0x00,
    parameters: {}
  }, {
    type: types.noteOn,
    time: 0x00,
    parameters: {}
  }, {
    type: types.noteOn,
    time: 0x00,
    parameters: {}
  }, {
    type: types.noteOn,
    time: 0x60,
    parameters: {}
  }, {
    type: types.noteOn,
    time: 0x60,
    parameters: {}
  }, {
    type: types.noteOff,
    time: 0xC0,
    parameters: {}
  }, {
    type: types.noteOff,
    time: 0x00,
    parameters: {}
  }, {
    type: types.noteOff,
    time: 0x00,
    parameters: {}
  }, {
    type: types.noteOff,
    time: 0x00,
    parameters: {}
  }, {
    type: types.endOfTrack,
    time: 0x00,
    parameters: {}
  }];
  MIDITools.importBinary('samples/mid/events-type0.mid', function(m) {

    QUnit.start();
    assert.equal(m.tracks.length, 1);
    assert.equal(m.tracks[0].events.length, events.length);
    var trackEvents = m.tracks[0].events;
    for (var i = 0, n = events.length; i < n; i++) {
      assert.equal(trackEvents[i].timestamp, events[i].time, 'msg: ' + i);
      assert.equal(trackEvents[i].message.type, events[i].type, 'msg: ' + i);
      var names = Object.keys(events[i].parameters);
      for (var j = 0, n2 = names.length; j < n2; j += 1) {
        var name = names[j];
        var expect = events[i].parameters[name];
        var actual = trackEvents[i].message.parameters[name];
        assert.equal(actual, expect, 'msg: ' + i + '| param: ' + name);
      }
    }
  }, function(err) {
    assert.ok(false, 'Import should not result in error');
    console.log(err);
  });
});

QUnit.asyncTest("export simple Type-1 MIDI", function(assert) {
  DOMLoader.sendRequest({
    url: 'samples/mid/simple1.mid',
    onload: function(req) {
      var expected = MIDITools.Utils.stringToBytes(req.responseText);
      MIDITools.importBinary('samples/mid/simple1.mid', function(m) {
        QUnit.start();
        var generated = MIDITools.Generators.Binary.generate(m);
        assert.deepEqual(generated, expected);
      }, function(err) {
        QUnit.start();
        assert.ok(false, 'Import should not result in error');
        console.log(err);
        console.log(err.stack);
      });
    }
  });
});
