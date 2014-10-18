QUnit.test("library load", function(assert) {
  assert.ok(MIDITools, "library loaded!");
});

QUnit.asyncTest("import simple Type-1 MIDI", function(assert) {
  MIDITools.importBinary('samples/mid/simple1.mid', function(m) {
    //console.log(m);
    assert.equal(m.type, 1);
    assert.equal(m.ticksPerBeat, 128);
    assert.equal(m.tracks.length, 1);
    window.s = m;
    QUnit.start();
  }, function (err) {
    QUnit.start();
    assert.ok(false, 'Import should not result in error');
    console.log(err);
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

QUnit.asyncTest("import Type-0 MIDI with track length > file size", function(assert) {
  MIDITools.importBinary('samples/mid/err-track-size.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Format.TrackLength);
    });
});

QUnit.asyncTest("import Type-0 MIDI with track length > file size", function(assert) {
  MIDITools.importBinary('samples/mid/err-track-size.mid',
    function(m) {
      QUnit.start();
      assert.ok(false, "Success callback should not be called on error");
    }, function(err) {
      QUnit.start();
      assert.equal(err, MIDITools.Errors.Format.TrackLength);
    });
});

QUnit.asyncTest("events of simple Type-1 MIDI", function(assert) {
  MIDITools.importBinary('samples/mid/simple1.mid', function(m) {
    console.log(m);
    assert.equal(m.tracks.length, 1);
    assert.equal(m.tracks[0].events.length, 5);
    assert.equal(m.tracks[0].events[0].timestamp, 0);
    QUnit.start();
  }, function (err) {
    QUnit.start();
    // debugger;
    assert.ok(false, 'Import should not result in error');
    console.log(err);
  });
});

QUnit.asyncTest("export simple Type-1 MIDI", function(assert) {
  DOMLoader.sendRequest({url: 'samples/mid/simple1.mid', onload: function(req) {
    var expected = MIDITools.Utils.stringToBytes(req.responseText);
    MIDITools.importBinary('samples/mid/simple1.mid', function(m) {
      var generated = MIDITools.Generators.Binary.generate(m);
      console.log(generated.length)
      assert.deepEqual(generated, expected);
      QUnit.start();
    }, function (err) {
      QUnit.start();
      assert.ok(false, 'Import should not result in error');
      console.log(err);
      console.log(err.stack);
  });
  }});

});
