var data = require('./data');

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
      value: 'unknown'
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
  this._meta.program.parameters.program = data.GeneralMIDI.byName[
    name];
  // TODO: Use replace event
};

MIDIChannel.prototype.getInstrument = function() {
  return this._meta.instrumentName.parameters.value;
};

MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
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

MIDIChannel.prototype.eventsInBeat = function(beatIndex) {
  // TODO: Translation for parameters, etc.
  var startTick = this._sequence.ticksPerBeat() * beatIndex;
  var endTick = startTick + this._sequence.ticksPerBeat();
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
