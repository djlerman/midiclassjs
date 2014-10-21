window.MIDITools.MIDIFile = (function(MIDI, MT) {
  'use strict';
  /*!
   * @class
   * @memberof MIDITools
   */
  function MIDIFile() {
    this._tracks = [];
    this._channels = [];
  }

  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */
  MIDIFile.prototype.play = function() {};
  
  MIDIFile.prototype.getEventsByType = function(type, trackNumber) {
    var track = this._tracks[trackNumber || 0];
    if (!track) return undefined;
    return track.events.filter(function(evt) {
      return (evt.message.type === type);
    });
  };

  MIDIFile.prototype.getEventByType = function(type, trackNumber) {
    return this.getEventsByType(type, trackNumber)[0];
  };

  MIDIFile.prototype.countMessages = function(trackNumber) {
    var track = this._tracks[trackNumber || 0];
    return track.events.length;
  };
  
  MIDIFile.prototype.trackCount = function() {
    return this._tracks.length;
  };
  
  MIDIFile.prototype.getType = function() {
    return this._type;
  };
  
  MIDIFile.prototype.getTrack = function(trackNumber) {
    return this._tracks[trackNumber];
  };
  
  

  return MIDIFile;
}(MIDI, window.MIDITools));


