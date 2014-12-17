var data = require('./data');

function MIDIChannel(t, n, m) {
  this._track = t;
  this._number = n;
  this._midi = m;
  var trackLength = this._midi.track(0).countEvents();
  this._totalTicks = 0;
  m.track(0).addEvent({
    timestamp: 0,
    message: 'midiChannelPrefix',
    parameters: {
      value: this._number
    }
  });
  m.track(0).addEvent({
    timestamp: 0,
    message: 'instrumentName',
    parameters: {
      value: 'unknown'
    }
  });
  m.track(0).addEvent({
    timestamp: 0,
    message: 'sequenceTrackName',
    parameters: {
      value: 'Untitled Track'
    }
  });
  
  this._track.addEvent({
    timestamp: 0,
    channel: this._number,
    message: 'programChange',
    parameters: {
      program: 1
    }
  });
  this._meta = {
    instrumentName: m.track(0).event(trackLength+1),
    trackName: m.track(0).event(trackLength+2),
    program: this._track.event(0)
  };
  
}

MIDIChannel.prototype.setName = function(name) {
  // TODO: replace with a sane method that sets value & 0 at same time
  this._meta.trackName.parameters.value = name;
  this._meta.trackName.parameters[0] = name;
};

MIDIChannel.prototype.getName = function() {
  return this._meta.trackName.parameters.value;
};

MIDIChannel.prototype.setInstrument = function(name) {
  // TODO: replace with a sane method that sets value & 0 at same time
  this._meta.instrumentName.parameters.value = name;
  this._meta.instrumentName.parameters[0] = name;
  // TODO: re-enable
  // this._meta.program.parameters.program = data.GeneralMIDI.byName[name];
  // TODO: Use replace event
};

MIDIChannel.prototype.getInstrument = function() {
  return this._meta.instrumentName.parameters.value;
};

MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
  this._totalTicks += delta;

  var spec = data.typeMap[msg];
  var evt = {
    timestamp: delta,
    channel: this._number,
    message: spec.message,
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

MIDIChannel.prototype.number = function() {
  return this._number;
};

MIDIChannel.prototype.toTrack = function() {
  return this._track;
};

MIDIChannel.prototype.repeat = function(n, offset) {
  var originalLength = this._track.countEvents();
  
  for (var i = 0; i < n; i += 1) {
    if (this._track.countEvents() > 1) {
      var first = Object.create(this._track.event(1)); // copy
      first.timestamp += offset;
      this._track.addEvent(first);
    }
    for (var j = 2; j < originalLength; j += 1) {
      this._track.addEvent(this._track.event(j));
    }
  }
};

MIDIChannel.prototype.countTicks = function() {
  return this._totalTicks;
};

MIDIChannel.prototype.eventsInBeat = function(beatIndex) {
  // TODO: Translation for parameters, etc.
  var startTick = this._midi.getTiming().ticksPerBeat * beatIndex;
  var endTick = startTick + this._midi.getTiming().ticksPerBeat;
  var currentTick = 0;
  var events = [];

  for (var i = 0, n = this.countEvents(); i < n; i += 1) {
    currentTick += this.event(i).timestamp;
    if (startTick <= currentTick && currentTick <= endTick && this.event(
        i).kind === 'channel') {
      events.push(this.event(i));
    }
  }
  return events;
};

module.exports = MIDIChannel;
