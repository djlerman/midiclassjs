QUnit.module("MIDIFile~importText");
QUnit.test("header information in empty valid t2mf file", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 0 1 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  midi.importText(input);
  assert.equal(midi.type(), 0);
  assert.equal(midi.countTracks(), 1);
  assert.equal(midi.getTiming().type, 'ticksPerBeat');
  assert.equal(midi.getTiming().ticksPerBeat, 480);
});


QUnit.test("track information in empty valid t2mf file", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 0 1 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  midi.importText(input);
  assert.equal(midi.track(0).countEvents(), 1);
  assert.equal(midi.track(0).event(0).message, 'endOfTrack');
});


QUnit.test("import invalid t2mf - prelude", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFiler 0 1 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
  }, MIDITools.Errors.Import.HeaderPrelude, 'should throw error');
});


QUnit.test("import invalid t2mf - type mismatch", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 0 2 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
  }, MIDITools.Errors.Import.Type0MultiTrack, 'should throw error');
});


QUnit.test("import invalid t2mf - track count too high", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 1 1000000 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
    console.log(midi);
  }, MIDITools.Errors.Import.TrackCount, 'should throw error');
});

QUnit.test("import invalid t2mf - track count too small", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 0 -1 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
  }, MIDITools.Errors.Import.TrackCount, 'should throw error');
});

QUnit.test("import invalid t2mf - #tracks < #declared", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 1 2 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
  }, MIDITools.Errors.Import.TracksMissing, 'should throw error');
});

QUnit.test("import invalid t2mf - invalid track header", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 1 1 480 ', '0 Meta TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
  }, MIDITools.Errors.Import.TrackPrelude, 'should throw error');
});

QUnit.test("import invalid t2mf - invalid delta-time on event", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 1 1 480 ', 'MTrk', 'apple Meta TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
  }, MIDITools.Errors.Import.DeltaInvalid, 'should throw error');
});

QUnit.test("import invalid t2mf - invalid message type", function(assert) {
  var midi = new MIDITools.MIDIFile();
  var input = ['MFile 1 1 480', 'MTrk', '0 Metas TrkEnd', 'TrkEnd'].join('\n');
  
  assert.throws(function() {
    midi.importText(input);
  }, MIDITools.Errors.Import.MessageType, 'should throw error');
});
