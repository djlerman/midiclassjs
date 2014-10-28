window.MIDITools.MIDIFile = (function(MIDI, MT) {
  'use strict';

  /*!
   * @class
   * @memberof MIDITools
   */
  function MIDIFile(type) {
    this._tracks = [];
    this._timing = {};
    this._type = (type === 0 || type === 1) ? type : 0;
    this._tracks = [];
    this.setTiming(96);
    
  }

  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */
  MIDIFile.prototype.play = function() {
    MIDI.Player.loadFile(this.exportBase64(), function() {
      MIDI.Player.start();
    });
  };

  MIDIFile.prototype.type = function() {
    return this._type;
  };

  MIDIFile.prototype.track = function(trackNumber) {
    return this._tracks[trackNumber];
  };

  MIDIFile.prototype.addTrack = function() {
    if (this._tracks.length === Math.pow(2, 16)) {
      throw MT.Errors.MIDI.TrackOverflow;
    }
    
    if (this._type === 0 && this._tracks.length === 1) {
      this._type = 1;
    }
    
    this._tracks.push(new MIDITools.MIDITrack(this._tracks.length));
  };

  MIDIFile.prototype.countTracks = function() {
    return this._tracks.length;
  };

  MIDIFile.prototype.getTiming = function() {
    // defensive copy
    return JSON.parse(JSON.stringify(this._timing));
  };

  MIDIFile.prototype.setTiming = function(timing) {
    var hasFrameParameters = (
      typeof timing === 'object' &&
      timing.hasOwnProperty('framesPerSecond') &&
      timing.hasOwnProperty('ticksPerFrame')
    );

    if (hasFrameParameters) {
      this._timing.type = 'framesPerSecond';
      this._timing.framesPerSecond = timing.framesPerSecond;
      this._timing.ticksPerFrame = timing.ticksPerFrame;
      this._channels = [];
    } else if (typeof timing === 'number') {
      this._timing.type = 'ticksPerBeat';
      this._timing.ticksPerBeat = timing;
    } else {
      throw MT.Errors.Parameters.SetTiming;
    }
  };

  return MIDIFile;

}(MIDI, window.MIDITools));
