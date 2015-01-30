'use strict';

var data = require('./data');
var errors = require('./errors');

function MIDITrack() {
  this._events = [];
  this._eventTypes = {};
}


/**
 * Returns the event object at index `i`.
 * 
 * @method event
 * @returns {Event} the `i`th event object in this track
 */

MIDITrack.prototype.event = function(i) {
  return this._events[i];
};


/**
 * Adds the given event to this track. Checks for all required
 * parameters for the event's type and throws an error if any are
 * missing. Furthermore, named index properties are also defined at
 * their appropriate index per the MIDI specification.
 *
 * @method addEvent
 *
 * @param {Object} evt
 * The event object to add to the track
 *
 * @throws {errors.track.invalidMessage} if the event's `message`
 *         property is invalid
 * @throws {errors.track.parameterMissing} if an event parameter
 *         is missing
 *
 * @todo Add parameter information
 */

MIDITrack.prototype.addEvent = function(evt) {
  this._events.push(checkEvent(evt));
};


/**
 * Adds all elements in `evts` to this track. Performs same checks as
 * `addEvent()`.
 *
 * @method addEvents
 *
 * @param {Object[]} evts
 * The event objects to add to the track
 *
 * @throws {errors.track.invalidMessage} if the event's `message`
 *         property is invalid
 * @throws {errors.track.parameterMissing} if an event parameter
 *         is missing
 * @see addEvent
 */

MIDITrack.prototype.addEvents = function(evts) {
  this._events = this._events.concat(evts.map(checkEvent));
};


/**
 * Replaces the event at index `i` with `evt`; `evt`'s parameters are
 * checked as if it were added with `addEvent`. Throws an error if the
 * parameters are invalid, and preserves current track events.
 * 
 * @method replaceEvent
 *
 * @param {Number} i
 * index of the event to replace
 * 
 * @param {Object} evt
 * MIDI event to insert into the track
 */

MIDITrack.prototype.replaceEvent = function(i, evt) {
  this._events.splice(i, 1, checkEvent(evt));
};


/**
 * Removes the event at index `i`.
 * 
 * @method replaceEvent
 *
 * @param {Number} i
 * index of the event to remove
 */

MIDITrack.prototype.removeEvent = function(i, evt) {
  this._events.splice(i, 1);
};


// Helper function; checks event parameters
function checkEvent(evt) {
  var spec = data.typeMap[evt.message];
  if (!spec) {
    throw errors.track.invalidMessage;
  }
  evt.kind = spec.kind;

  var checked = {};
  if (spec.length === 'variable') {
    if (evt.parameters.value === undefined) {
      throw errors.track.parameterMissing;
    }
    checked.value = evt.parameters.value;
  } else {
    spec.parameters.forEach(function(p, index) {
      if (evt.parameters[p.name] === undefined) {
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
 * Returns the number of events stored in this track.
 *
 * @method countEvents
 * @return {Number} the number of events stored in this track
 */

MIDITrack.prototype.countEvents = function(trackNumber) {
  return this._events.length;
};


/**
 * Returns all events in the track whose `message` property matches
 * `msg`. Message types include `noteOn`, `programChange`, etc.
 *
 * @method filterEvents
 *
 * @param {string} msg
 * The message type by which to filter events
 */

MIDITrack.prototype.filterEvents = function(msg) {
  return this._events.filter(function(evt) {
    return (evt.message === msg);
  });
};

module.exports = MIDITrack;
