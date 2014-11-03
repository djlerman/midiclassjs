(function(imports, exports) {
  'use strict';

  function MIDISequence() {
    this._midi = new imports.MIDIFile();
    this._channels = [];
    this._tempo = 120;
    this._ts = '4/4';


    this._midi.addTrack(); // meta information
    this._midi.track(0).addEvent({
      message: 'sequenceTrackName',
      timestamp: 0,
      parameters: {
        value: 'Untitled'
      }
    });
    this._midi.track(0).addEvent({
      message: 'setTempo',
      timestamp: 0,
      parameters: {
        microsecondsPerBeat: imports.Utils.bpmToTempo(this._tempo)
      }
    });
    this._midi.track(0).addEvent({
      message: 'timeSignature',
      timestamp: 0,
      parameters: imports.Utils.fromTimeSignature('4/4')
    });
    this._meta = {
      sequenceName: this._midi.track(0).event(0),
      tempo: this._midi.track(0).event(1),
      timeSignature: this._midi.track(0).event(2),
    };
  }

  MIDISequence.prototype.countBeats = function() {
    return Math.ceil(getLargestTickCount(this) / this.ticksPerBeat());
  }; 

  function getLargestTickCount(midi) {
    return midi.usedChannels()
      .map(function(ch) {
        var ticks = 0;
        for (var i = 0; i < ch.countEvents(); i += 1) {
          ticks += ch.event(i).timestamp;        
        }
        console.log(ticks);
        return ticks;
      })
      .reduce(function(previous, current) {
        return Math.max(previous, current);
      }, 0);
  }

  MIDISequence.prototype.getTempo = function() {
    return this._tempo;
  };

  MIDISequence.prototype.ticksPerBeat = function() {
    return this._midi.getTiming().ticksPerBeat;
  };

  MIDISequence.prototype.setTempo = function(bpm) {
    this._tempo = bpm;
    this._meta.tempo.parameters.microsecondsPerBeat = imports.Utils.bpmToTempo(
      bpm);
  };

  MIDISequence.prototype.getTimeSignature = function() {
    return {
      numerator: this._meta.timeSignature.parameters.numerator,
      denominator: this._meta.timeSignature.parameters.denominator
    };
  };

  MIDISequence.prototype.setTimeSignature = function(ts) {
    this._ts = ts;
    this._meta.timeSignature.parameters = imports.Utils.fromTimeSignature(ts);
  };

  MIDISequence.prototype.getName = function() {
    return this._meta.sequenceName.parameters.value;
  };

  MIDISequence.prototype.setName = function(name) {
    this._meta.sequenceName.parameters.value = name;
  };


  MIDISequence.prototype.usedChannels = function() {
    var used = [];
    for (var i = 0; i < 16; i += 1) {
      if (this._channels[i]) {
        used.push(this.channel(i));
      }
    }
    return used;
  };


  MIDISequence.prototype.channel = function(n) {
    if (!this._channels[n]) {
      var trackCount = this._midi.countTracks();
      this._midi.addTrack();
      this._channels[n] = new MIDIChannel(this._midi.track(trackCount), n, this);
    }
    return this._channels[n];
  };

  MIDISequence.prototype.toFile = function() {
    for (var i = 0, n = this._midi.countTracks(); i < n; i += 1) {
      this._midi.track(i).addEvent({
        message: 'endOfTrack',
        timestamp: 0,
        parameters: {}
      });
    }
    return this._midi;
  };

  function MIDIChannel(t, n, s) {
    this._track = t;
    this._number = n;
    this._sequence = s;
    this._track.addEvent({
      timestamp: 0,
      message: 'midiChannelPrefix',
      parameters: {
        value: this._number
      }
    });
    this._track.addEvent({
      timestamp: 0,
      message: 'instrumentName',
      parameters: {
        value: this._number
      }
    });
    this.addEvent(0, 'programChange', {
      program: 1
    });
    this._track.addEvent({
      timestamp: 0,
      message: 'sequenceTrackName',
      parameters: {
        value: 'Untitled Track'
      }
    });
    this._meta = {
      instrumentName: this._track.event(1),
      program: this._track.event(2),
      trackName: this._track.event(3)
    };
  }

  MIDIChannel.prototype.setName = function(name) {
    this._meta.trackName.parameters.value = name;
  };

  MIDIChannel.prototype.getName = function() {
    return this._meta.trackName.parameters.value;
  };

  MIDIChannel.prototype.setInstrument = function(name) {
    this._meta.instrumentName.parameters.value = name;
    this._meta.program.parameters.program = imports.Data.GeneralMIDI.byName[name];
    // TODO: Use replace event
    console.log(this._program);
  };

  MIDIChannel.prototype.getInstrument = function() {
    return this._meta.instrumentName.parameters.value;
  };

  MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
    var spec = imports.Data.typeMap[msg];
    var evt = {
      timestamp: delta,
      channel: this._number,
      message: spec.type,
      parameters: parameters
    };

    this._track.addEvent(evt);
  };

  MIDIChannel.prototype.countEvents = function() {
    return this._track.countEvents();
  };

  MIDIChannel.prototype.event = function(index) {
    // TODO: Translation for parameters, etc.
    return this._track.event(index);
  };
  MIDIChannel.prototype.eventsInBeat = function(beatIndex) {
    // TODO: Translation for parameters, etc.
    var startTick = this._sequence.ticksPerBeat() * beatIndex;
    var endTick = startTick + this._sequence.ticksPerBeat();
    var currentTick = 0;
    var events = [];

    for (var i = 0, n = this.countEvents(); i < n; i += 1) {
      currentTick += this.event(i).timestamp;
      if (startTick <= currentTick &&currentTick <= endTick && this.event(i).kind === 'channel') {
        events.push(this.event(i));
      }
    }
    return events;
  };

  exports.MIDISequence = MIDISequence;

}(window.MIDITools, window.MIDITools));
