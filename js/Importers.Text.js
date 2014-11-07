'use strict';

var errors = require('./Errors');
var data = require('./Data');
var MIDIFile = require('./MIDIFile');

var matches = {};

Object.defineProperty(matches, 'NEWLINE', {
  value: /[\r\n]+/,
  writable: false
});
Object.defineProperty(matches, 'WHITESPACE', {
  value: /\s+/,
  writable: false
});

var strings = {
  'HEADER_PRELUDE': 'MFile',
  'TRACK_START_MARKER': 'MTrk',
  'TRACK_END_MARKER': 'TrkEnd'
};


function importText(midi, text) {
  var lines = text.split(matches.NEWLINE).map(function(s) {
    return s.trim();
  });

  var header = lines.shift();
  parseHeader(midi, header);

  var trackLines = splitTracks(lines);
  if (trackLines.length < midi.countTracks()) {
    throw errors.Import.TracksMissing;
  }
  trackLines.forEach(function(tl, index) {
    parseTrack(midi.track(index), tl);
  }.bind(midi));
  return midi;
}

function parseTrack(track, lines) {
  var trackHeader = lines.shift();

  if (trackHeader !== strings.TRACK_START_MARKER) {
    throw errors.Import.TrackPrelude;
  }

  lines.forEach(function(line) {
    parseEvent(track, line);
  });
}

function parseEvent(track, text) {
  var pieces = text.split(matches.WHITESPACE);

  var delta = parseInt(pieces.shift());
  if (pieces.length < 1 || isNaN(delta)) {
    throw errors.Import.DeltaInvalid;
  }

  var type = extractType(pieces);

  if (type === undefined) {
    throw errors.Import.MessageType;
  }

  var msg = parseMessage(type, pieces);

  track.addEvent({
    timestamp: delta,
    message: type.message,
    parameters: msg.parameters
  });
}

function parseMessage(spec, pieces) {
  switch (spec.kind) {
    case 'channel':
      return parseChannelMessage(spec, pieces);
    case 'meta':
      return parseMetaMessage(spec, pieces);
    case 'sysex':
      return parseSysExMessage(spec, pieces);
    default:
      throw errors.Import.MessageType;
  }
}

function parseChannelMessage(spec, pieces) {
  return spec;
}

function parseMetaMessage(spec, pieces) {
  return spec;
}

function parseSysExMessage(spec, pieces) {
  return spec;
}

function extractType(pieces) {
  var typeName = pieces.shift();
  if (typeName === 'Meta') {
    typeName += ' ' + pieces.shift();
  }

  return data.textMap[typeName];
}

function splitTracks(lines) {
  var lastIndex = 0;
  var result = [];
  lines.forEach(function(line, index) {
    if (line === strings.TRACK_END_MARKER) {
      result.push(lines.slice(lastIndex, index));
    }
  });
  return result;
}

function parseHeader(midi, text) {
  var pieces = text.split(matches.WHITESPACE);

  var declaredType = parseInt(pieces[1]);
  var count = parseInt(pieces[2]);

  if (pieces[0] !== strings.HEADER_PRELUDE) {
    throw errors.Import.HeaderPrelude;
  }

  if (isNaN(declaredType)) {
    throw errors.Import.Type;
  }

  if (isNaN(count) || count < 0) {
    throw errors.Import.TrackCount;
  }

  try {
    for (var i = 0; i < count; i += 1) {
      midi.addTrack();
    }
  } catch (err) {
    if (err === errors.MIDI.TrackOverflow) {
      throw errors.Import.TrackCount;
    } else {
      throw err;
    }
  }

  if (midi.type() !== declaredType) {
    if (midi.type() === 0) {
      // TODO: either change API to have setType() or dont put
      // this method on the MF instance
      midi._type = 1;
    } else {
      throw errors.Import.Type0MultiTrack;
    }
  }

  // TODO: SMPTE timing
  //<division> is either a positive number (giving the time resolution in
  //clicks per quarter note) or a negative number followed by a positive
  //number (giving SMPTE timing)

  midi.setTiming(parseInt(pieces[3]));
}


module.exports = importText;
