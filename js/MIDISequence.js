'use strict';
var MIDIFile = require('./MIDIFile');
var MIDIChannel = require('./MIDIChannel');
var errors = require('./errors');
var data = require('./data');
var util = require('./util');

function MIDISequence() {
  this._midi = new MIDIFile();
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
      microsecondsPerBeat: util.bpmToTempo(this._tempo)
    }
  });
  this._midi.track(0).addEvent({
    message: 'timeSignature',
    timestamp: 0,
    parameters: util.fromTimeSignature('4/4')
  });
  this._meta = {
    sequenceName: this._midi.track(0).event(0),
    tempo: this._midi.track(0).event(1),
    timeSignature: this._midi.track(0).event(2)
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
      return ticks;
    })
    .reduce(function(previous, current) {
      return Math.max(previous, current);
    }, 0);
}
MIDISequence.prototype.beatLength = function() {
  return (60000 / this._tempo);
};

MIDISequence.prototype.ticksPerBeat = function() {
  return this._midi.getTiming().ticksPerBeat;
};

MIDISequence.prototype.getTempo = function() {
  return this._tempo;
};

MIDISequence.prototype.setTempo = function(bpm) {
  this._tempo = parseInt(bpm);
  this._meta.tempo.parameters.microsecondsPerBeat = util.bpmToTempo(bpm);
  // TODO: create a utility checkEvent?
  this._meta.tempo.parameters[0] = util.bpmToTempo(bpm);
  
};
MIDISequence.prototype.changeTempo = function(when, bpm) {
  var tempoEvent = {
    timestamp: when,
    message: 'setTempo',
    parameters: {
      microsecondsPerBeat: util.bpmToTempo(bpm)
    }
  };
  this._midi.track(0).addEvent(tempoEvent);
};

MIDISequence.prototype.getTimeSignature = function() {
  return {
    numerator: this._meta.timeSignature.parameters.numerator,
    denominator: this._meta.timeSignature.parameters.denominator
  };
};

MIDISequence.prototype.setTimeSignature = function(ts) {
  this._ts = ts;
  this._meta.timeSignature.parameters = util.fromTimeSignature(
    ts);
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
    this._channels[n] = new MIDIChannel(this._midi.track(trackCount), n,
      this._midi);
  }
  return this._channels[n];
};

MIDISequence.prototype.countTicks = function() {
  return this.usedChannels().reduce(function(maxTicks, current) {
    var channelTicks = current.countTicks();
    return (maxTicks < channelTicks) ? channelTicks : maxTicks;
  }, 0);
};
MIDISequence.prototype.repeat = function(n) {
  var maxTicks = this.usedChannels().reduce(function(maxTicks, current) {
    var channelTicks = current.countTicks();
    return (maxTicks < channelTicks) ? channelTicks : maxTicks;
  }, 0);

  this.usedChannels().forEach(function(channel) {
    channel.repeat(n, (maxTicks - channel.countTicks()));
  });
};


MIDISequence.prototype.toFile = function() {
  this.usedChannels().forEach(function(ch) {
    ch.addEvent(0, 'endOfTrack', {});
  });
  return this._midi;
};

module.exports = MIDISequence;
