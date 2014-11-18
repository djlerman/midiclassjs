(function(global) {
  
  var MIDIFile = require('./MIDIFile');

  exports.createMIDI = function(type) {
    return new MIDIFile(type);
  };

  exports.MIDISequence = require('./MIDISequence');
  exports.errors = require('./errors');
  exports.Data = require('./data');
  exports.Utils = require('./util');


  global.MIDITools = module.exports;
}(this));
