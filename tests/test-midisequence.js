QUnit.module("MIDISequence");

QUnit.test("countBeats with empty sequence returns data", function(assert) {
  var midi = new MIDITools.MIDISequence();
  assert.equal(midi.countBeats(), 0);
});

QUnit.test("countBeats with single beat", function(assert) {
  var midi = new MIDITools.MIDISequence();
  midi.setTimeSignature('4/4');
  var m = midi.ticksPerBeat();

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });
  assert.equal(midi.countBeats(), 1);

});

QUnit.test("countBeats with several beats", function(assert) {
  var midi = new MIDITools.MIDISequence();
  midi.setTimeSignature('4/4');
  var m = midi.ticksPerBeat();

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  assert.equal(midi.countBeats(), 3);
});

QUnit.test("countBeats with overlapping beats", function(assert) {
  var midi = new MIDITools.MIDISequence();
  midi.setTimeSignature('4/4');
  var m = midi.ticksPerBeat();

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(180, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  assert.equal(midi.countBeats(), 4);
});

QUnit.test("eventsInBeat with single beat", function(assert) {
  var midi = new MIDITools.MIDISequence();
  midi.setTimeSignature('4/4');
  var m = midi.ticksPerBeat();
  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });
  assert.equal(midi.channel(0).eventsInBeat(0).length, 3);
  assert.equal(midi.channel(0).eventsInBeat(0)[0].message, 'noteOn');
  assert.equal(midi.channel(0).eventsInBeat(0)[1].message, 'noteOn');
});

QUnit.test("countBeats with several beats", function(assert) {
  var midi = new MIDITools.MIDISequence();
  midi.setTimeSignature('4/4');
  var m = midi.ticksPerBeat();

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  assert.equal(midi.countBeats(), 3);
});

QUnit.test("countBeats with overlapping beats", function(assert) {
  var midi = new MIDITools.MIDISequence();
  midi.setTimeSignature('4/4');
  var m = midi.ticksPerBeat();

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(95, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  midi.channel(0).addEvent(0, 'noteOn', {
    note: 0x3C,
    velocity: 0x60
  });
  midi.channel(0).addEvent(180, 'noteOff', {
    note: 0x3C,
    velocity: 0x60
  });

  assert.equal(midi.countBeats(), 4);
});
