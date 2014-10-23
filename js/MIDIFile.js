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

  MIDIFile.prototype.type = function() {
    return this._type;
  };

  MIDIFile.prototype.track = function(trackNumber) {
    return this._tracks[trackNumber];
  };

  MIDIFile.prototype.addTrack = function() {
    if (this._type === 0 && this._tracks.count === 1) {
      this._type = 1; 
    }
    this._tracks.push(new MIDITrack(this._tracks.length));
  };
    
  MIDIFile.prototype.countTracks = function() {
    return this._tracks.length;
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

  function MIDITrack(n) {
    this._number = n;
    this._events = [];
    this._eventTypes = {};
  }

  MIDITrack.prototype.event = function(i) {
    return this._events[i];
  };

  MIDITrack.prototype.addEvent = function(evt) {
    this._events.push(evt);
  };

  MIDITrack.prototype.replaceEvent = function(i, evt) {
    this._events[i] = evt;
  };

  MIDITrack.prototype.countEvents = function(trackNumber) {
    return this._events.length;
  };

  MIDITrack.prototype.filterEvents = function(type) {
    return this._events.filter(function(evt) {
      return (evt.message.type === type);
    });
  };

  // MIDIFile.prototype.channel = function(n) {
  //   if (!this._channels[n]) {
  //     var trackCount = this.trackCount();
  //     if (trackCount !== Math.pow(2, 16)) {
  //       this.addTrack();
  //     } else {
  //       trackCount -= 1; // reduce index
  //     }
  //     this._channels[n] = new MIDIChannel(this.track(trackCount), n);
  //   }
  //   return this._channels[n];
  // };
  //
  // function MIDIChannel(t, n) {
  //   this.track = t;
  //   this.number = n;
  // }
  //
  // MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
  //   var spec = MT.Data.typeMap[msg];
  //   var evt = {
  //     channel: this.number,
  //     timestamp: delta,
  //     kind: spec.kind,
  //     message: spec.type,
  //     parameters: {}
  //   };
  //
  //   spec.parameters.forEach(function(p, index) {
  //     if (parameters[p.name] === 'undefined') {
  //       // TODO: Create custom error
  //       throw new Error('Parameter left undefined');
  //     }
  //     evt.parameters[p.name] = parameters[p.name];
  //     evt.parameters[index] = evt.parameters[p.name];
  //   });
  //   this.track.addEvent(evt);
  // };
  //
  return MIDIFile;

}(MIDI, window.MIDITools));
