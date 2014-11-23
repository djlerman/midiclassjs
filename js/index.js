(function(global) {
  var http = require('http');
  var fs = require('fs');
  var MIDIFile = require('./MIDIFile');
  var MIDISequence = require('./MIDISequence');
  exports.MIDIFile = MIDIFile;
  exports.createMIDI = function(type) {
    return new MIDIFile(type);
  };
  exports.createSequence = function() {
    return new MIDISequence();
  };

  exports.loadMIDIFromURL = function(src, callback, error) {
    if (!src || !callback) {
      throw new Error('Both parameters required!');
    }
    http.get(src, function(res) {
      var result = '';
      res.on('data', function(chunk) {
        result += chunk;
      });
      res.on('end', function() {
        try {
          return callback(MIDIFile.fromBinary(toByteString(result)));
        } catch (err) {
          return (error && error(err)) || false;
        }
      });
    }).on('error', function(e) {
      return (error && error(err)) || false;
    });
  };

  exports.loadMIDIFromFile = function(path, callback, error) {
    if (!path || !callback) {
      throw new Error('Both parameters required!');
    }
    fs.readFile(path, function(err, data) {
      if (err) {
        return (error && error(err)) || false;
      }
      try {
        return callback(MIDIFile.fromBinary(Array.prototype.slice.call(
          data)));
      } catch (e) {
        return (error && error(e)) || false;
      }
    });

  };

  function toByteString(str) {
    return Array.prototype.map.call(str, function(ch) {
      return (0x00FF & ch.charCodeAt(0));
    });
  }


  exports.MIDISequence = require('./MIDISequence');
  exports.errors = require('./errors');
  exports.Data = require('./data');
  exports.Utils = require('./util');
  exports.util = require('./util');


  global.MIDITools = module.exports;
}(this));
