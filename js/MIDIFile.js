window.MIDITools.MIDIFile = (function(MIDI, MT) {
  'use strict';
  /*!
   * @class
   * @memberof MIDITools
   */
  function MIDIFile(timing) {
    this._tracks = [];
    this._channels = [];
    this._timing = {};
    this._type = 0;
    this._tracks = [];
    this.addTrack();

    if (timing) {
      this.setTiming(timing);
    } else {
      this.setTiming(96);
    }
  }

  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */
  MIDIFile.prototype.play = function() {};
  MIDIFile.prototype.addTrack = function() {
    this._tracks.push({
      number: this._tracks.length,
      events: [MT.Utils.textToEvent('Meta TrkEnd')],
      eventTypes: {}
    });
  };
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

  MIDIFile.prototype.getTiming = function() {
    // defensive copy
    return JSON.parse(JSON.stringify(this._timing));
  };

  MIDIFile.prototype.setTiming = function(timing) {
    if (typeof timing === 'number') {
      this._timing.type = 'ticksPerBeat';
      this._timing.ticksPerBeat = timing;
    } else if (typeof timing === 'object') {
      this._timing.type = 'framesPerSecond';
      // TODO: Check that keys exist
      this._timing.framesPerSecond = timing.framesPerSecond;
      this._timing.ticksPerFrame = timing.ticksPerFrame;
    }
  };

  MIDIFile.prototype.getTrack = function(trackNumber) {
    return this._tracks[trackNumber];
  };



  return MIDIFile;
}(MIDI, window.MIDITools));
