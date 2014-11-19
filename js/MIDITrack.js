'use strict';

var data = require('./data');
var errors = require('./errors');

/**
 * Creates a new MIDITrack
 */
function MIDITrack() {
  this._events = [];
  this._eventTypes = {};
}


/**
 * Returns the event object at index `i`.
 * @returns the `i`th event object in this track
 */

MIDITrack.prototype.event = function(i) {
  return this._events[i];
};


/**
 * Adds the given event to this track. Checks
 * for all required parameters for the event's type
 * and throws an error if any are missing. Furthermore,
 * defines index properties for these parameters in their defined
 * ordering as per the MIDI specification.
 *
 * @throws error.track.parameterMissing if an event parameter
 *         is missing
 */

MIDITrack.prototype.addEvent = function(evt) {
  this._events.push(checkEvent(evt));
};

/**
 * Replaces the event at index `i` with `evt`;
 * `evt`'s parameters are checked as if it were added
 * with `addEvent`. Throws an error if the parameters
 * are invalid, and preserves current track events.
 */
MIDITrack.prototype.replaceEvent = function(i, evt) {
  this._events.splice(i, 1, checkEvent(evt));
};


function checkEvent(evt) {
  var spec = data.typeMap[evt.message];
  evt.kind = spec.kind;

  var checked = {};
  if (spec.length === 'variable') {
    checked.value = evt.parameters.value;
  }
  else {
    spec.parameters.forEach(function(p, index) {
      if (evt.parameters[p.name] === 'undefined') {
	throw errors.track.parameterMissing;
      }
      checked[p.name] = evt.parameters[p.name];
      checked[index] = checked[p.name];
    });
  }

  evt.parameters = checked;
  return evt;
}


/**
 * Returns the number of events stored in this track
 * @return {Number} the number of events stored in this track
 */

MIDITrack.prototype.countEvents = function(trackNumber) {
  return this._events.length;
};


MIDITrack.prototype.filterEvents = function(type) {
  return this._events.filter(function(evt) {
        return (evt.message === type);
  });
};

module.exports = MIDITrack;
