var MIDIFile = require('../js/MIDIFile');
var errors = require('../js/errors');

describe('importText', function() {
  it('should accept header in minimal t2mf file', function() {
    var input = ['MFile 0 1 480', 'MTrk', '0 Meta TrkEnd', 'TrkEnd']
      .join('\n');

    var midi = MIDIFile.importText(input);

    expect(midi.type()).toBe(0);
    expect(midi.countTracks()).toBe(1);
    expect(midi.getTiming().type).toBe('ticksPerBeat');
    expect(midi.getTiming().ticksPerBeat).toBe(480);
  });


  it('should accept tracks from empty t2mf file', function() {
    var input = [
      'MFile 0 1 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'
    ].join('\n');
    var midi = MIDIFile.importText(input);

    expect(midi.track(0).countEvents()).toBe(1);
    expect(midi.track(0).event(0).message).toBe('endOfTrack');
  });


  it('should throw error for invalid t2mf prelude', function() {
    var input = [
      'MFiler 0 1 480', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'
    ].join('\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.HeaderPrelude);
  });


  it('should throw error for t2mf with type mismatch', function() {
    var input = [
      'MFile 0 2 480',
      'MTrk', '0 Meta TrkEnd', 'TrkEnd',
      'MTrk', '0 Meta TrkEnd', 'TrkEnd'
    ].join('\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.Type0MultiTrack);
  });


  it('should throw error for t2mf with track count too high', function() {
    var input = [
      'MFile 1 1000000 480', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'
    ].join('\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.TrackCount);
  });

  it('should throw error for t2mf with track count too small', function() {
    var input = [
      'MFile 0 -1 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'
    ].join(
      '\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.TrackCount);
  });

  it('should throw error for t2mf with #tracks < #declared', function() {
    var input = [
      'MFile 1 2 480 ', 'MTrk', '0 Meta TrkEnd', 'TrkEnd'
    ].join(
      '\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.TracksMissing);
  });

  it('should throw error for t2mf with invalid track header', function() {
    var input = [
      'MFile 1 1 480 ', '0 Meta TrkEnd', 'TrkEnd'
    ].join('\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.TrackPrelude);
  });

  it('should throw error for t2mf event with ivalid delta-time', function() {
    var input = [
      'MFile 1 1 480 ', 'MTrk', 'apple Meta TrkEnd',
      'TrkEnd'
    ].join('\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.DeltaInvalid);
  });

  it('should throw error for t2mf event with invalid message', function() {
    var input = [
      'MFile 1 1 480', 'MTrk', '0 Metas TrkEnd', 'TrkEnd'
    ].join(
      '\n');

    expect(function() {
      MIDIFile.importText(input);
    }).toThrow(errors.import.MessageType);
  });
});
