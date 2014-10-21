QUnit.test("export empty Type-0 MIDI", function(assert) {
  var midi = MIDITools.createMIDI();
  var actual = midi.exportBinary();
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
  var expected = new Uint8Array(vals.length);
  expected.set(vals);

  assert.deepEqual(actual, expected);
});
