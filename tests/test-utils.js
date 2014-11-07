QUnit.test("create noteOn event", function(assert) {
  var actual = MIDITools.Utils.textToEvent('On 0x3C 0x60');
  var expected = {
    kind: 'channel',
    message: MIDITools.Data.eventTypes.noteOn.message,
    parameters: {
      'note': 0x3C,
      'velocity': 0x60
    }
  };
  assert.deepEqual(expected, actual);
});
