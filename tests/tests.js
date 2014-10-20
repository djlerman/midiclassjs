QUnit.test("library load", function(assert) {
  assert.ok(MIDITools, "library loaded!");
});

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
      assert.ok(err === MIDITools.Errors.Format.HeaderPrelude);
    });
});

QUnit.asyncTest("import MIDI with header size > file size", function(assert) {
  MIDITools.importBinary('samples/mid/err-header-size.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Format.HeaderSize);
    });
});

QUnit.asyncTest("import Type-0 MIDI with track count > 1", function(assert) {
  MIDITools.importBinary('samples/mid/err-type0-multi.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Format.Type0MultiTrack);
    });
});

QUnit.asyncTest("import MIDI with invalid prelude", function(assert) {
  MIDITools.importBinary('samples/mid/err-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.ok(err === MIDITools.Errors.Format.HeaderPrelude);
    });
});

QUnit.asyncTest("import Type-0 MIDI with invalid track prelude", function(
  assert) {
  MIDITools.importBinary('samples/mid/err-track-prelude.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Format.TrackPrelude);
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
      assert.equal(err, MIDITools.Errors.Format.TrackFooter);
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

QUnit.asyncTest("events of simple Type-1 MIDI", function(assert) {
  MIDITools.importBinary('samples/mid/simple1.mid', function(m) {
    QUnit.start();
    assert.equal(m.tracks.length, 1);
    assert.equal(m.tracks[0].events.length, 5);
    assert.equal(m.tracks[0].events[0].timestamp, 0);
  }, function(err) {
    QUnit.start();
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
        console.log(generated.length);
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
