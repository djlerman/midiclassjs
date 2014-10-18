window.MIDITools.Utils = (function() {
  'use strict';

  function stringToBytes(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0, n = str.length; i < n; i += 1) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }
  
  return {
    stringToBytes: stringToBytes
  };
}());
