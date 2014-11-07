'use strict';
var data = require('./Data.js');
function MIDITrack(n) {
  this._number = n;
  this._events = [];
  this._eventTypes = {};
}

MIDITrack.prototype.event = function(i) {
  return this._events[i];
};

MIDITrack.prototype.addEvent = function(evt) {
  var spec = data.typeMap[evt.message];
  evt.kind = spec.kind;
  var parameters = evt.parameters;
  evt.parameters = {};
  if (spec.length !== 'variable') {
    spec.parameters.forEach(function(p, index) {
      if (parameters[p.name] === 'undefined') {
        // TODO: Create custom error
        throw new Error('Parameter left undefined');
      }
      evt.parameters[p.name] = parameters[p.name];
      evt.parameters[index] = evt.parameters[p.name];
    });
  } else {
    evt.parameters.value = parameters.value;
  }
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
    return (evt.message === type);
  });
};

module.exports = MIDITrack;
