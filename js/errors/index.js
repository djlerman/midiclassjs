'use strict';

exports.midi = {
  trackOverflow: new Error('addTrack called on MIDIFile with 2^16 tracks.'),
  constructor: new Error('createMIDI parameter value must be 0 or 1'),
  setTiming: new Error('setTiming requires a number or a `fps` object.'),
  track: new Error('track(n) called with an invalid value'),
  removeInvalidTrack: new Error('Attempted to remove a non-existent track.')
};
exports.track = {
  parameterMissing: new Error('The event is missing a required parameter.'),
  invalidMessage: new Error('The event contains an invalid message.')
};

exports.general = {
  volumeRange: new RangeError('invalid volume (outside 0 - 127)'),
  instrumentRange: new RangeError('invalid instrument ID (outside 0 - 127)'),
  channelRange: new RangeError('invalid channel ID (outside 0 - 15)')
};

exports.import = {
  DeltaInvalid: new Error('Event contained an invalid delta-time value'),
  FileSize: new Error('File is too small to be a standard MIDI file.'),
  HeaderPrelude: new Error('File did not contain standard MIDI header.'),
  HeaderSize: new Error('File size is smaller than its declared header size.'),
  MessageType: new Error('File had a MIDI message with an unknown type.'),
  MetaType: new Error('File had a meta message with an unknown subtype.'),
  ChannelType: new Error('File had a channel message with an unknown subtype.'),
  TrackCount: new Error('File declared a number of tracks outside 0-(2^16).'),
  TrackLength: new Error(
    'File contains a track declared with the wrong size.'),
  TracksMissing: new Error(
    'File does not contain as many tracks it declares.'),
  TrackPrelude: new Error('File did not contain standard MIDI track header.'),
  TrackFooter: new Error('File did not contain standard MIDI track footer.'),
  Type: new Error('File must be either Type-0 or Type-1.'),
  Type0MultiTrack: new Error(
    'File format is Type-0, but declares multiple tracks.')
};
