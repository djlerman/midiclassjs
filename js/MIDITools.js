window.MIDITools = (function(MIDI) {
  'use strict';

  /**
   * Represents a sequence of MIDI messages.
   */
  function MIDIFile(ticksPerBeat) {
    this.type = 0; // TODO: should we just make this type 1?
    this.ticksPerBeat = ticksPerBeat;
    this.tracks = [];
    this.channels = [];
  }


  /*!
   * MIDIFile API
   */


  /**
   * Plays the MIDI sequence currently defined by this instance.
   * TODO: Add callback functionality
   */

  MIDIFile.prototype.play = function() {};


  /*!  
   * Module-level functions
   */


  var createEmptyMIDI = function(ticksPerBeat) {
    return new MIDIFile(ticksPerBeat);
  };

  /*!
   * Export API
   */

  return {
    createMIDI: createEmptyMIDI,
    MIDIFile: MIDIFile
  };

}(MIDI));

window.MIDITools.StatusValues = {
  'noteOff': 0x8,
  'noteOn': 0x9,
  'afterTouch': 0xA,
  'controlChange': 0xB,
  'programChange': 0xC,
  'channelPressure': 0xD,
  'pitchWheel': 0xE,
  'meta': 0xF
};

window.MIDITools.StatusTypes = {
  0x8: 'noteOff',
  0x9: 'noteOn',
  0xA: 'afterTouch',
  0xB: 'controlChange',
  0xC: 'programChange',
  0xD: 'channelPressure',
  0xE: 'pitchWheel',
  0xF: 'meta'
};

window.MIDITools.Parsers = {};

window.MIDITools.Parsers.binary = (function(MIDI, MT) {
  'use strict';

  var MIN_HEADER_LENGTH = 14;
  var HEADER_PRELUDE = 'MThd';
  var TRACK_PRELUDE = 'MTrk';
  
  /**
   * @param{} src
   */
  var importBinary = function(src, callback, error) {

    if (!src || !callback) {
      throw new Error('Both parameters required!');
    }

    DOMLoader.sendRequest({
      url: src,
      onload: function(req) {
        try {
          callback(fromBinary(toByteString(req.responseText)));
        } catch (err) {
          error && error(err);
        }
      },
      onerror: function() {
        // TODO: replace with custom error type?
        throw new Error('Could not load file');
      }
    });
  };

  function fromBinary(bytes) {
    var m = new MT.MIDIFile(0);
    parseHeader(m, bytes);
    parseTracks(m, bytes);
    return m;
  }
  
  // ============================
  // = MIDI File Header Parsing =
  // ============================

  function parseHeader(m, bytes) {
    parseHeaderPrelude(bytes);
    var headerSize = parseHeaderSize(bytes);
    m.type = parseType(bytes);
    
    parseTracksDeclaration(m, bytes);
    m.ticksPerBeat = parseHeaderTPB(bytes);
  }

  function parseHeaderTPB(bytes) {
    return parseInteger(bytes, 2);
  }

  function parseTracksDeclaration(m, bytes) {
    var trackCount = parseTrackCount(bytes);
    if (m.type === 0 && trackCount !== 1) {
      throw MT.Errors.Format.Type0MultiTrack;
    }
    for (var i = 0; i < trackCount; i += 1) {
      m.tracks.push({
        number: i,
        events: [],
      });
    }
  }

  function parseHeaderPrelude(bytes) {
    // first, check length requirement
    if (bytes.length < MIN_HEADER_LENGTH) {
      throw MT.Errors.Format.FileSize;
    }
    
    parseStringConstant(bytes, HEADER_PRELUDE, MT.Errors.Format.HeaderPrelude);
  }

  function parseHeaderSize(bytes) {
    var size = parseInteger(bytes, 4);
    if (bytes.length < size) {
      throw MT.Errors.Format.HeaderSize;
    } else {
      return size;
    }
  }

  function parseTrackCount(bytes) {
    return parseInteger(bytes, 2);
  }

  function parseType(bytes) {
    var type = parseInteger(bytes, 2);
    if (type !== 0 && type !== 1) {
      throw MT.Errors.Format.Type;
    } else {
      return type;
    }
  }
  
  // ======================
  // = MIDI Track Parsing =
  // ======================

  function parseTracks(m, bytes) {
    for (var i = 0, n = m.tracks.length; i < n; i += 1) {
      parseTrack(m, m.tracks[i], bytes);
    }
  }
  
  function parseTrack(m, track, bytes) {
    parseTrackHeader(m, track, bytes);
    parseTrackMetadata(track, bytes);
  }
  
  function parseTrackHeader(m, track, bytes) {
    parseTrackPrelude(bytes);
    track.length = parseTrackLength(bytes);
    m.tracks[0].bytes = bytes;
  }
  
  function parseTrackLength(bytes) {
    var size = parseInteger(bytes, 4);
    if (bytes.length < size) {
      throw MT.Errors.Format.TrackLength;
    } else {
      return size;
    }
  }

  function parseTrackPrelude(bytes) {
    parseStringConstant(bytes, TRACK_PRELUDE, MT.Errors.Format.TrackPrelude);
  }

  function parseTrackMetadata(track, bytes) {
    var rawEvent;
    do {
      rawEvent = parseRawEvent(bytes);
      track.events.push(rawEvent);
    } while (false);
  }

  // ================================
  // = MIDI Message / Event Parsing =
  // ================================
  function parseRawEvent(bytes) {
    var timestamp = parseVariableInteger(bytes);
    var status = parseInteger(bytes, 1);
    var type = (status & 0xF0) >> 4;
    var channel = (status & 0x0F) >> 4;
    return {
      'timestamp': timestamp,
      'type': type,
      'channel': channel 
    };
  }
  
  // =======================
  // = Byte Interpretation =
  // =======================
  
  function parseStringConstant(bytes, constant, err) {
    var length = constant.length;
    var value = String.fromCharCode.apply(null, bytes.slice(0, length));
    if (value !== constant) {
      throw err;
    }
    
    // remove header bytes
    for (var i = 0; i < length; i += 1) {
      bytes.shift();
    }
  }

  function parseVariableInteger(bytes) {
    var b = 0;
    var result = 0;
    do {
      b = bytes.shift();
      if (b >= 0x80) {
				result += (b & 0x7f);
				result <<= 7;
      } else {
        result += b;
      }
    } while (b >= 0x80);
    return result;
  }

  function parseInteger(bytes, limit) {
    var result = 0;
    for (var i = 0; i < limit; i += 1) {
      var shiftAmount = 8 * (limit - i - 1);
      var value = bytes.shift();
      result += (value << shiftAmount);
    }
    return result;
  }

  function toByteString(str) {
    return Array.prototype.map.call(str, function(ch) {
      return (0x00FF & ch.charCodeAt(0));
    });
  }

  return importBinary;
}(MIDI, MIDITools));

window.MIDITools.Errors = (function(MT) {
  'use strict';
  return {
    Format: {
      FileSize: new Error('File is too small to be a standard MIDI file.'),
      HeaderPrelude: new Error('File did not contain standard MIDI header.'),
      HeaderSize: new Error('File size is smaller than its declared header size.'),
      TrackCount: new Error('File declared a number of tracks outside 0-16.'),
      TrackLength: new Error('File contains a track declared with the wrong size.'),
      TrackPrelude: new Error('File did not contain standard MIDI track header.'),
      Type: new Error('File must be either Type-0 or Type-1.'),
      Type0MultiTrack: new Error('File format is Type-0, but declares multiple tracks.')
    }
  };
}(MIDITools));

window.MIDITools.importBinary = window.MIDITools.Parsers.binary;
