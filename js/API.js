(function(exports, Tools) {
  exports.importBinary = Tools.Importers.Binary;
  exports.createMIDI = function() {
    return new Tools.MIDIFile();
  };
  
  exports.textToEvent = Tools.Utils.textToEvent;
  Tools.MIDIFile.prototype.exportBinary = function() {
    return MIDITools.Exporters.Binary(this);
  };
  Tools.MIDIFile.prototype.exportBase64 = function() {
    return 'base64,' + btoa(MIDITools.Exporters.Binary(this));
  };
}(window.MIDITools, window.MIDITools));