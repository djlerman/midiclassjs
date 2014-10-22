window.MIDITools.Utils = (function(MT) {
  'use strict';

  function stringToBytes(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0, n = str.length; i < n; i += 1) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }
  var valueParsers = {
    'string': function(pieces) {
      return pieces.shift();
    },
    'number': function(pieces) {
      return parseInt(pieces.shift());
    }
  };
  function textToEvent(text) {
    var pieces = text.split(/\s+/);
    if (pieces[0] === 'Meta') {
      // TODO: check that pieces[1] exists
      pieces.shift();
      pieces[0] = 'Meta' + ' ' + pieces[0];
    }
    var spec = MT.Data.textMap[pieces.shift()];
    if (!spec) {
      throw MT.Errors.Text.MessageType;
    }
    
    var evt = {
      kind: spec.kind,
      message: spec.type,
      parameters: {}
    };
    spec.parameters.forEach(function(p, index) {
      if (p.length === 'variable') {
        evt.parameters.value = pieces.join(' ');
      } if (p.importers && p.importers.text) {
        p.importers.text(pieces, evt.parameters);
      } else {
        evt.parameters[p.name] = valueParsers[p.valueType](pieces);
      }
    });
    
    return evt;
  }
  return {
    stringToBytes: stringToBytes,
    textToEvent: textToEvent,
  };
}(window.MIDITools));
