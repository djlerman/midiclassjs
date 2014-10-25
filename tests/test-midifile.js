QUnit.module( "MIDIFile" );
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
  assert.equal(midi.type(), 1, 'type changes to 1 after adding a second track');
  assert.equal(midi.countTracks(), 2);
});

QUnit.test("addTrack - adding second track changes type to 1", function(assert) {
  var midi = new MIDITools.MIDIFile();
  
  midi.addTrack();
  assert.equal(midi.type(), 0);
  
  midi.addTrack();
  assert.equal(midi.type(), 1, 'type changes to 1 after adding a second track');
  assert.equal(midi.countTracks(), 2);
});



QUnit.test("addTrack - adding second track changes type to 1", function(assert) {
  var midi = new MIDITools.MIDIFile();
  
  midi.addTrack();
  assert.equal(midi.type(), 0);
  
  midi.addTrack();
  assert.equal(midi.type(), 1, 'type changes to 1 after adding a second track');
  assert.equal(midi.countTracks(), 2);
});


