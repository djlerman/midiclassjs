(function(exports, Tools) {
  exports.createMIDI = function() {
    return new Tools.MIDIFile();
  };
  
  exports.textToEvent = Tools.Utils.textToEvent;

  Tools.MIDIFile.prototype.exportBase64 = function() {
    return 'base64,' + btoa(this.exportBinary());
  };

}(window.MIDITools, window.MIDITools));
