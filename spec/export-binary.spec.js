var mt = require('../js/index');

describe('exportBinary', function() {
  it('should export an empty MIDIFile as an empty SMF', function() {
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

    var expected = vals.map(function(ch) {
      return String.fromCharCode(ch);
    }).join('');

    var midi = mt.createMIDI();
    midi.addTrack();
    midi.track(0).addEvent({
      kind: 'meta',
      message: 'endOfTrack',
      parameters: {}
    });
    var actual = midi.exportBinary();
    expect(actual).toBe(expected);
  });

  it('should export a 3-event MIDIFile correctly', function() {
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

    var expected = vals.map(function(ch) {
      return String.fromCharCode(ch);
    }).join('');

    var midi = mt.createMIDI();
    midi.addTrack();
    midi.track(0).addEvent({
      channel: 0,
      message: 'noteOn',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      timestamp: 0x60,
      channel: 0,
      message: 'noteOff',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      kind: 'meta',
      message: 'endOfTrack',
      parameters: {}
    });
    var actual = midi.exportBinary();
    expect(actual).toBe(expected);
  });

  it('should export a programChange event correctly', function() {
    var vals = [
      0x4D, 0x54, 0x68, 0x64, /* MThd*/
      0x00, 0x00, 0x00, 0x06, /* Header length*/
      0x00, 0x00, /* Type-0*/
      0x00, 0x01, /* 1 track*/
      0x00, 0x60, /* 96 ticks/beat (default if none set)*/
      0x4D, 0x54, 0x72, 0x6B, /* MTrk*/
      0x00, 0x00, 0x00, 0x0F, /* Track length*/
      0x00, 0xC0, 0x38,       /* Use 'Trumpet' instrument */
      0x00, 0x90, 0x3C, 0x60, /* Play middle C */
      0x60, 0x80, 0x3C, 0x60, /* Stop middle C after 1 beat */
      0x00, 0xFF, 0x2F, 0x00  /* Track footer */
    ];

    var expected = vals.map(function(ch) {
      return String.fromCharCode(ch);
    }).join('');

    var midi = mt.createMIDI();
    midi.addTrack();
    midi.track(0).addEvent({
      channel: 0,
      message: 'programChange',
      parameters: {
        program: 0x38
      }
    });
    midi.track(0).addEvent({
      channel: 0,
      message: 'noteOn',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      timestamp: 0x60,
      channel: 0,
      message: 'noteOff',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      message: 'endOfTrack',
      parameters: {}
    });
    var actual = midi.exportBinary();
    expect(actual).toBe(expected);
  });

  it('should export a timesignature event correctly', function() {
    var vals = [
      0x4D, 0x54, 0x68, 0x64, /* MThd*/
      0x00, 0x00, 0x00, 0x06, /* Header length*/
      0x00, 0x00, /* Type-0*/
      0x00, 0x01, /* 1 track*/
      0x00, 0x60, /* 96 ticks/beat (default if none set)*/
      0x4D, 0x54, 0x72, 0x6B, /* MTrk*/
      0x00, 0x00, 0x00, 0x1C, /* Track length*/
      0x00, 0x90, 0x3C, 0x60, /* Play middle C */
      0x60, 0x80, 0x3C, 0x60, /* Stop middle C after 1 beat */
      0x00, 0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08, /*time signature*/
      0x00, 0x90, 0x3C, 0x60, /* Play middle C */
      0x60, 0x80, 0x3C, 0x60, /* Stop middle C after 1 beat */
      0x00, 0xFF, 0x2F, 0x00 /* Track footer */
    ];

    var expected = vals.map(function(ch) {
      return String.fromCharCode(ch);
    }).join('');

    var midi = mt.createMIDI();
    midi.addTrack();

    midi.track(0).addEvent({
      channel: 0,
      message: 'noteOn',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      timestamp: 0x60,
      channel: 0,
      message: 'noteOff',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      message: 'timeSignature',
      parameters: {
        numerator: 4,
        denominator: 2,
        metronome: 24,
        thirtySeconds: 8
      }
    });
    midi.track(0).addEvent({
      channel: 0,
      message: 'noteOn',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      timestamp: 0x60,
      channel: 0,
      message: 'noteOff',
      parameters: {
        note: 0x3C,
        velocity: 0x60
      }
    });
    midi.track(0).addEvent({
      message: 'endOfTrack',
      parameters: []
    });
    var actual = midi.exportBinary();
    expect(actual).toBe(expected);
  });
});
