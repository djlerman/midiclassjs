window.MIDITools.Builder = (function(imports, exports) {
  'use strict';

  function MIDISequence() {
    this._midi = new imports.MIDIFile();
    this._midi.addTrack(); // meta information
    this._channels = [];
    this._tempo = 120;
    this._ts = '4/4';
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
      tempo: this._midi.track(0).event(0),
      timeSignature: this._midi.track(0).event(1)
    };
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


  MIDISequence.prototype.channel = function(n) {
    if (!this._channels[n]) {
      var trackCount = this._midi.countTracks();
      if (trackCount !== Math.pow(2, 16)) {
        this._midi.addTrack();
      } else {
        trackCount -= 1; // reduce index
      }
      this._channels[n] = new MIDIChannel(this._midi.track(trackCount), n);
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

  function MIDIChannel(t, n) {
    this._track = t;
    this._number = n;
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
        value: 'unknown'
      }
    });
    this.addEvent(0, 'programChange', {
      program: 1
    });
    this._nameParam = this._track.event(1).parameters;
    this._program = this._track.event(2).parameters;
  }

  MIDIChannel.prototype.setName = function(name) {
    this._nameParam.value = name;
  };

  MIDIChannel.prototype.getName = function(bpm) {
    return this._nameParam.value;
  };

  MIDIChannel.prototype.setInstrument = function(name) {
    console.log(name);
    this._program.program = imports.Data.GeneralMIDI.byName[name];
    // TODO: Use replace  event
    console.log(this._program);
  };

  MIDIChannel.prototype.getInstrument = function(bpm) {
    return this._program.program;
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

  exports.MIDISequence = MIDISequence;

}(window.MIDITools, window.MIDITools));
