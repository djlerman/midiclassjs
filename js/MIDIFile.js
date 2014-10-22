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
  MIDIFile.prototype.play = function() {
    MIDI.Player.loadFile(this.exportBase64(), function() {
      MIDI.Player.start();
    });
  };

  MIDIFile.prototype.addTrack = function() {
    this._tracks.push(new MIDITrack(this._tracks.length));
  };

  MIDIFile.prototype.getEventsByType = function(type, trackNumber) {
    var track = this._tracks[trackNumber || 0];
    // TODO: throw error
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
      this._channels = [];
    }
  };

  MIDIFile.prototype.track = function(trackNumber) {
    return this._tracks[trackNumber];
  };

  MIDIFile.prototype.channel = function(n) {
    if (!this._channels[n]) {
      var trackCount = this.trackCount();
      if (trackCount !== Math.pow(2, 16)) {
        this.addTrack();
      } else {
        trackCount -= 1; // reduce index
      }
      this._channels[n] = new MIDIChannel(this.track(trackCount), n);
    }
    return this._channels[n];
  };

  MIDIFile.prototype.addTextEvent = function(text, trackNumber) {
    var track = this._tracks[trackNumber || 0];
    track.events.push(MT.Utils.textToEvent(text));
  };

  function MIDITrack(n) {
    this.number = n;
    this.events = [];
    this.eventTypes = {};
    this.events.push(MT.Utils.textToEvent('Meta TrkEnd'));
  }

  MIDITrack.prototype.addEvent = function(evt) {
    var end = this.events.pop(); // remove trackEnd event
    this.events.push(evt);
    this.events.push(end);
  };

  function MIDIChannel(t, n) {
    this.track = t;
    this.number = n;
  }

  MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
    var spec = MT.Data.typeMap[msg];
    var evt = {
      timestamp: delta,
      kind: spec.kind,
      message: spec.type,
      parameters: {}
    };
    spec.parameters.forEach(function(p, index) {
      if (parameters[p] === 'undefined') {
        // TODO: Create custom error
        throw new Error('Parameter left undefined');
      }
      evt.parameters[p] = parameters[p];
    });
    this.track.events.push(evt);
  };
  
  return MIDIFile;

}(MIDI, window.MIDITools));
