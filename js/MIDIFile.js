window.MIDITools.MIDIFile = (function(MIDI, MT) {
  'use strict';
  /*!
   * @class
   * @memberof MIDITools
   */
  function MIDIFile(ticksPerBeat) {
    this.type = 0; // TODO: should we just make this type 1?
    this.ticksPerBeat = ticksPerBeat;
    this.tracks = [];
    this.channels = [];
  }

  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */
  MIDIFile.prototype.play = function() {};
  
  MIDIFile.prototype.getEventsByType = function(type, trackNumber) {
    var track = this.tracks[trackNumber || 0];
    if (!track) return undefined;
    return track.events.filter(function(evt) {
      return (evt.message.type === type);
    });
  };

  MIDIFile.prototype.getEventByType = function(type, trackNumber) {
    return this.getEventsByType(type, trackNumber)[0];
  };

  MIDIFile.prototype.countMessages = function(trackNumber) {
    var track = this.tracks[trackNumber || 0];
    return track.events.length;
  };

  return MIDIFile;
}(MIDI, window.MIDITools));


