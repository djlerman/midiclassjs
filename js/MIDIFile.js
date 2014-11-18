'use strict';

/*!
 * Module dependencies
 */

var errors = require('./errors');
var importers = require('./importers');
var exporters = require('./exporters');
var MIDITrack = require('./MIDITrack');

/**
 * Creates a new MIDIFile
 *
 * @param {Number} [type] - the type of the midifile; only needed
 *        if you desire a single-track Type-1 file
 * @throws errors.parameters.Type if type is not 0 or 1
 */

function MIDIFile(type) {
  if (type !== undefined && !(type === 0 || type === 1)) {
    throw errors.midi.constructor;
  }
  this._tracks = [];
  this._timing = {};
  this._type = (type) ? type : 0;
  this._tracks = [];
  this.setTiming(96);
}


/**
 * Returns the type (0 or 1) of this MIDIFile.
 * @returns {Number} the type of the MIDI file
 */

MIDIFile.prototype.type = function() {
  return this._type;
};


/**
 * Returns the {miditools.MIDITrack} at index `n`
 * @returns {miditools.MIDITrack} the track at index `n`
 */

MIDIFile.prototype.track = function(n) {
  if (n < 0 || n >= this._tracks.length) {
    throw errors.midi.track;
  }
  return this._tracks[n];
};


/**
 * Adds a new, empty track to the file, then returns the track.
 * @returns {MIDITools.MIDITrack} the newly-added track
 * @throws errors.midi.trackOverflow if the file already has
 *         the maximum number of tracks
 */

MIDIFile.prototype.addTrack = function() {
  if (this._tracks.length === Math.pow(2, 16)) {
    throw errors.midi.trackOverflow;
  }

  if (this._type === 0 && this._tracks.length === 1) {
    this._type = 1;
  }

  this._tracks.push(new MIDITrack());
  return this._tracks[this._tracks.length - 1];
};


/**
 * Removes the track at index `n` from the file
 * @throws errors.midi.removeInvalidTrack if the track does
 *         not exist in this file
 */

MIDIFile.prototype.removeTrack = function(n) {
  if (this._tracks.length <= n) {
    throw errors.midi.removeInvalidTrack;
  }
  this._tracks.splice(n, 1);
};


/**
 * Returns the number of tracks in the MIDIFile.
 * @returns {Number} total number of tracks stored in the MIDIFile
 */

MIDIFile.prototype.countTracks = function() {
  return this._tracks.length;
};


/**
 * @returns the timing of the MIDIFile, which is usually a measure
 *          of *ticks per beat*; see ??? for details
 * TODO: put reference in above description
 */

MIDIFile.prototype.getTiming = function() {
  // defensive copy
  return JSON.parse(JSON.stringify(this._timing));
};


/**
 * Sets the MIDI file's header field for time divisions.
 * @param {Number|PlainObject} If `timing` is a number,
 *        then the MIDIFile's division type will be set to
 *        `ticksPerBeat` and the number will be used as the
 *        value of this field. If `timing` is an object,
 *        then it must have the properties `framesPerSecond` and
 *        `ticksPerFrame`, and these will be used to set the
 *        time division as documented in ???
 * TODO: add reference
 */

MIDIFile.prototype.setTiming = function(timing) {
  var hasFrameParameters = (
    typeof timing === 'object' &&
    timing.hasOwnProperty('framesPerSecond') &&
    timing.hasOwnProperty('ticksPerFrame')
  );

  if (hasFrameParameters) {
    this._timing.type = 'framesPerSecond';
    this._timing.framesPerSecond = timing.framesPerSecond;
    this._timing.ticksPerFrame = timing.ticksPerFrame;
    this._channels = [];
  } else if (typeof timing === 'number') {
    this._timing.type = 'ticksPerBeat';
    this._timing.ticksPerBeat = timing;
  } else {
    throw errors.midi.setTiming;
  }
};


MIDIFile.prototype.exportBase64 = function() {
  return 'base64,' + window.btoa(this.exportBinary());
};

MIDIFile.fromBinary = function(binary) {
  return importers.binary(new MIDIFile(), binary);
};




MIDIFile.importText = function(text) {
  return importers.text(new MIDIFile(), text);
};


MIDIFile.prototype.exportBinary = function() {
  return exporters.binary(this);
};

module.exports = MIDIFile;
