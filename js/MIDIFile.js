'use strict';

/*!
 * Module dependencies
 */

var MIDITrack = require('./MIDITrack');
var errors = require('./errors');
var importers = require('./importers');
var exporters = require('./exporters');


/**
 * Creates a new MIDIFile
 * @classdesc A representation of a standard MIDI file (SMF).
 * @class
 * @memberof MIDITools
 */

function MIDIFile(type) {
  this._tracks = [];
  this._timing = {};
  this._type = (type === 0 || type === 1) ? type : 0;
  this._tracks = [];
  this.setTiming(96);
}

/**
 * @returns {Number} the type (0 or 1) of the MIDI file
 */
MIDIFile.prototype.type = function() {
  return this._type;
};

/**
 * @returns {MIDITools.MIDITrack} the track at index `n`
 */
MIDIFile.prototype.track = function(n) {
  return this._tracks[n];
};

MIDIFile.prototype.addTrack = function() {
  if (this._tracks.length === Math.pow(2, 16)) {
    throw errors.MIDI.TrackOverflow;
  }

  if (this._type === 0 && this._tracks.length === 1) {
    this._type = 1;
  }

  this._tracks.push(new MIDITrack(this._tracks.length));
};

MIDIFile.prototype.countTracks = function() {
  return this._tracks.length;
};

MIDIFile.prototype.exportBase64 = function() {
  return 'base64,' + btoa(this.exportBinary());
};

MIDIFile.prototype.getTiming = function() {
  // defensive copy
  return JSON.parse(JSON.stringify(this._timing));
};

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
    throw errors.Parameters.SetTiming;
  }
};

function toByteString(str) {
  return Array.prototype.map.call(str, function(ch) {
    return (0x00FF & ch.charCodeAt(0));
  });
}

MIDIFile.importBinary = function(src, callback, error) {
  if (!src || !callback) {
    throw new Error('Both parameters required!');
  }

  DOMLoader.sendRequest({
    url: src,
    onload: function(req) {
      try {
        return callback(importers.binary(new MIDIFile(), toByteString(req.responseText)));
      } catch (err) {
        return (error && error(err)) || false;
      }
    },
    onerror: function() {
      // TODO: replace with custom error type?
      throw new Error('Could not load file');
    }
  });
};


MIDIFile.importText = function (text) {
  return importers.text(new MIDIFile(), text);
};
MIDIFile.prototype.exportBinary = function () {
  return exporters.binary(this);
};

module.exports = MIDIFile;
