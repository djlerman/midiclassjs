QUnit.module("MIDIFile");
QUnit.test("constructor creates default file", function(assert) {
  var midi = new MIDITools.MIDIFile();
  assert.equal(midi.countTracks(), 0);
  assert.equal(midi.getTiming().type, 'ticksPerBeat');
  assert.equal(midi.getTiming().ticksPerBeat, 96);
  assert.equal(midi.type(), 0);
});

QUnit.test("addTrack - add single track to empty file", function(assert) {
  var midi = new MIDITools.MIDIFile();
  midi.addTrack();
  assert.equal(midi.countTracks(), 1);
});

QUnit.test("addTrack - adding second track changes type to 1", function(assert) {
  var midi = new MIDITools.MIDIFile();

  midi.addTrack();
  assert.equal(midi.type(), 0);

  midi.addTrack();
  assert.equal(midi.type(), 1,
    'type changes to 1 after adding a second track');
  assert.equal(midi.countTracks(), 2);
});

QUnit.test("addTrack - throws error on too many tracks", function(assert) {
  var midi = new MIDITools.MIDIFile();
  midi.addTrack();
  assert.throws(function() {
    for (var i = 0; i < Math.pow(2, 16)+1; i += 1) {
      midi.addTrack();
    }
  }, MIDITools.Errors.MIDI.TrackOverflow);
});

QUnit.test("setTiming - throws error on non-number literal", function(assert) {
  var midi = new MIDITools.MIDIFile();
  midi.addTrack();
  assert.throws(function() {
    midi.setTiming('120');
  }, MIDITools.Errors.Parameters.SetTiming);
});

QUnit.test("setTiming - throws error on object with bad values", function(assert) {
  var midi = new MIDITools.MIDIFile();
  midi.addTrack();
  assert.throws(function() {
    midi.setTiming({
      framesPerSecond: 25,
      invalid: 40
    });
  }, MIDITools.Errors.Parameters.SetTiming);
});

QUnit.test("setTiming - sets type and value appropriately given number", function(assert) {
  var midi = new MIDITools.MIDIFile();
  midi.addTrack();
  midi.setTiming(120);
  assert.equal(midi.getTiming().type, 'ticksPerBeat');
  assert.equal(midi.getTiming().ticksPerBeat, 120);
});

QUnit.test("setTiming - sets type and value appropriately given object", function(assert) {
  var midi = new MIDITools.MIDIFile();
  midi.addTrack();
  midi.setTiming({
    framesPerSecond: 25,
    ticksPerFrame: 40
  });
  assert.equal(midi.getTiming().type, 'framesPerSecond');
  assert.equal(midi.getTiming().framesPerSecond, 25);
  assert.equal(midi.getTiming().ticksPerFrame, 40);
});
