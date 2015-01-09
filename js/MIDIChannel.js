// # MIDIChannel

'use strict';

var data = require('./data');
var errors = require('./errors');

//
// ## Overview
//

// The `MIDIChannel` API is provided as a thin wrapper around a
// `MIDITrack` object. When using the `MIDISequence` API to build a
// new MIDI file, this API is useful for manipulating the metadata
// required for the channel.  Any channel accessed by the client is
// assigned:
//
// - a name
// - an instrument
// - a volume setting

// These may be manipulated without dealing with the underlying
// event/message API.

//
// ## API
//

/**
 * Returns this channel's assigned number. This is a read-only value.
 *
 * @method number
 * @returns {Number} between 0 and 15
 */

MIDIChannel.prototype.number = function() {
  return this._number;
};


/**
 * Returns the channel's name. By default, this is `channelN`,
 * where `N` is the channel's number (0 -- 15).
 *
 * @method getName
 * @returns {String}
 */

MIDIChannel.prototype.getName = function() {
  return this._meta.event(this._events.trackName).parameters.value;
};


/**
 * Sets the name of the channel to the value of `name`.
 *
 * @method setName
 * @param {String} name
 */

MIDIChannel.prototype.setName = function(name) {
  var nameEvent = this._meta.event(this._events.trackName);
  nameEvent.parameters.value = name;
  this._meta.replaceEvent(this._events.trackName, nameEvent);
};


/**
 * Returns the channel's volume at the start of the MIDI
 * sequence. This value is not affected by `controlChange` events
 * that occur later in the sequence, so the manual insertion of
 * another volume-change event later will cause this value to be
 * incorrect. By default, this value is 64.
 * **Note:** This volume is the *coarse volume*; no support is
 * available for *fine volume*.
 *
 * @method getVolume
 * @returns {Number} in the range [0 - 127]
 */

MIDIChannel.prototype.getVolume = function() {
  return this._track.event(this._events.volume).parameters.value;
};


/**
 * Sets the channel's volume at the start of the MIDI sequence. This
 * method has no affect on by volume-changing `controlChange` events
 * that occur later in the sequence. Setting the value to 0 will
 * mute the channel.
 *
 * **Note:** This volume is the *coarse volume*; no support is
 * available for *fine volume*.
 *
 * @method setVolume
 * @param {Number [0 - 127]} newVolume The channel's new volume level.
 * @throws {errors.general.volumeRange} if `newVolume` is outside
 *         the required range
 */

MIDIChannel.prototype.setVolume = function(newVolume) {
  if (!(0 <= newVolume && newVolume <= 127)) {
    throw errors.general.volumeRange;
  }

  var volumeEvent = this._track.event(this._events.volume);
  volumeEvent.parameters.value = newVolume;
  this._track.replaceEvent(this._events.volume, volumeEvent);
};


/**
 * Returns the assigned instrument for this channel. This value is not
 * affected by `programChange` events that occur later in the
 * sequence, so the manual insertion of a `programChange` event
 * later will cause this value to be incorrect. By default, this value
 * is 0, (Acoustic Grand Piano, for General MIDI).
 *
 * @method getInstrument
 *
 * @returns {Number [0 - 127]} the id of this channel's instrument
 */

MIDIChannel.prototype.getInstrument = function() {
  return this._track.event(this._events.program).parameters.program;
};


/**
 * Sets the channel's instrument to `id`.
 *
 * @method setInstrument
 * @param {Number [0 - 127]} id channel's new instrument
 * @throws {errors.general.instrumentRange} if `id` is outside
 *         the required range
 */

MIDIChannel.prototype.setInstrument = function(id) {
  if (!(0 <= id && id <= 127)) {
    throw errors.general.instrumentRange;
  }
  var programEvent = this._track.event(this._events.program);
  programEvent.parameters.program = id;
  this._track.replaceEvent(this._events.program, programEvent);
};


/**
 * Returns the event at index `i`.
 *
 * @method event
 * @returns {Object} the event at index `i`
 */

MIDIChannel.prototype.event = function(index) {
  return this._track.event(index);
};


/**
 * Appends the given event to this channel. Checks for all required
 * parameters for the event's type and throws an error if any are
 * missing. Though the event need not be a channel event, it should
 * be a valid event for a track other than track 0 of a Type-1 MIDI
 * file.
 *
 * @method addEvent
 *
 * @param {Number} delta number of ticks between the last event in the
 *        channel and this event
 * @param {String} msg The message type of the event
 * @param {Object} parameters A map of parameter values for the event
 *
 * @throws {error.track.parameterMissing} if an event parameter
 *         is missing
 */

MIDIChannel.prototype.addEvent = function(delta, msg, parameters) {
  var spec = data.typeMap[msg];
  var evt = {
    timestamp: delta,
    message: spec.message,
    parameters: parameters
  };

  if (spec.kind === 'channel') {
    evt.channel = this._number;
  }

  this._track.addEvent(evt);
};


/**
 * Returns a MIDI track representation of this channel.  Modifications
 * to this track will affect the channel, so no guarantees are made
 * about correctness of methods after this operation is complete. This
 * method is provided for modifying the track further after the
 * MIDIChannel abstraction is no longer needed.
 * 
 * @method toTrack
 *
 * @returns {MIDITrack}
 */

MIDIChannel.prototype.toTrack = function() {
  return this._track;
};


//
// ## Representation
//

// The MIDISequence API keeps a 1:1 relationship between channels and
// tracks. The MIDIChannel's track should only contain channel events
// associated with that channel. This constructor and the various
// MIDIChannel methods maintain convention.

/**
 * **Note: Clients should not normally use this constructor.**
 *
 * @param {Number} n the number of this channel
 * @param {MIDITrack} t the representative track. It should be empty.
 * @param {MIDITrack} mt the track to use for metadata
 */

function MIDIChannel(n, t, mt) {
  var metaLength = mt.countEvents();
  this._track = t;
  this._number = n;
  this._meta = mt;

  mt.addEvent({
    timestamp: 0,
    message: 'midiChannelPrefix',
    parameters: {
      value: this._number
    }
  });

  mt.addEvent({
    timestamp: 0,
    message: 'sequenceTrackName',
    parameters: {
      value: 'channel' + n
    }
  });

  this._track.addEvent({
    timestamp: 0,
    channel: this._number,
    message: 'programChange',
    parameters: {
      program: 0
    }
  });
  this._track.addEvent({
    timestamp: 0,
    channel: this._number,
    message: 'controlChange',
    parameters: {
      controller: data.controllers.VOLUME,
      value: 64
    }
  });

  this._events = {
    trackName: metaLength+1,
    program: 0,
    volume: 1
  };

}

module.exports = MIDIChannel;
