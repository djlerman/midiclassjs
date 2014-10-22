QUnit.test("export empty Type-0 MIDI", function(assert) {
  var vals = [
    0x4D, 0x54, 0x68, 0x64, /* MThd*/
    0x00, 0x00, 0x00, 0x06, /* Header length*/
    0x00, 0x00, /* Type-0*/
    0x00, 0x01, /* 1 track*/
    0x00, 0x60, /* 96 ticks/beat (default if none set)*/
    0x4D, 0x54, 0x72, 0x6B, /* MTrk*/
    0x00, 0x00, 0x00, 0x04, /* Track length*/
    0x00, 0xFF, 0x2F, 0x00 /* Track footer */
  ];
  
  var expected = vals.map(function(ch) { return String.fromCharCode(ch); }).join('');
  
  var midi = MIDITools.createMIDI();
  var actual = midi.exportBinary();
  assert.deepEqual(actual, expected);
});

QUnit.test("export simple Type-0 MIDI", function(assert) {
  var vals = [
    0x4D, 0x54, 0x68, 0x64, /* MThd*/
    0x00, 0x00, 0x00, 0x06, /* Header length*/
    0x00, 0x00, /* Type-0*/
    0x00, 0x01, /* 1 track*/
    0x00, 0x60, /* 96 ticks/beat (default if none set)*/
    0x4D, 0x54, 0x72, 0x6B, /* MTrk*/
    0x00, 0x00, 0x00, 0x0C, /* Track length*/
    0x00, 0x90, 0x3C, 0x60, /* Play middle C */
    0x60, 0x80, 0x3C, 0x60, /* Stop middle C after 1 beat */
    0x00, 0xFF, 0x2F, 0x00 /* Track footer */
  ];
  var expected = vals.map(function(ch) { return String.fromCharCode(ch); }).join('');
  
  var midi = MIDITools.createMIDI();
  midi._tracks[0].events = [{
    kind: 'channel',
    channel: 0,
    message: 'noteOn',
    parameters: [0x3C, 0x60]
  }, {
    timestamp: 0x60,
    kind: 'channel',
    channel: 0,
    message: 'noteOff',
    parameters: [0x3C, 0x60]
  }, {
    kind: 'meta',
    message: 'endOfTrack',
    parameters: []
  }];
  var actual = midi.exportBinary();
  assert.deepEqual(actual, expected);
});
