window.MIDITools.Errors = (function() {
  'use strict';
  return {
    Import: {
      FileSize: new Error('File is too small to be a standard MIDI file.'),
      HeaderPrelude: new Error('File did not contain standard MIDI header.'),
      HeaderSize: new Error(
        'File size is smaller than its declared header size.'),
      MessageType: new Error('File had a MIDI message with an unknown type.'),
      MetaType: new Error('File had a meta message with an unknown subtype.'),
      TrackCount: new Error('File declared a number of tracks outside 0-16.'),
      TrackLength: new Error(
        'File contains a track declared with the wrong size.'),
      TrackPrelude: new Error(
        'File did not contain standard MIDI track header.'),
      TrackFooter: new Error(
        'File did not contain standard MIDI track footer.'),
      Type: new Error('File must be either Type-0 or Type-1.'),
      Type0MultiTrack: new Error(
        'File format is Type-0, but declares multiple tracks.')
    }
  };
}());