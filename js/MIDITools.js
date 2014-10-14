window.MIDITools = (function(MIDI) {
  'use strict';

  /**
   * Represents a sequence of MIDI messages.
   */
  function MIDIFile(ticksPerBeat) {
    this.header = {
      format: 0,  // TODO: should we just make this track 1?
      ticksPerBeat: ticksPerBeat
    };
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

  MIDIFile.prototype.play = function() {
    MIDI.Player.loadFile(songs[0], function() {
      MIDI.Player.start();
    });
  }


  /*!
   * "Static functions"; accessible from the MIDITools object, but
   * not instance-specific.
   */

  var createEmptyMIDI = function(ticksPerBeat) {
    return new MIDIFile(ticksPerBeat);
  };


  /*!
   * Export API
   */

  return {
    createMIDI: createEmptyMIDI,
    loadMIDI: function(midi) {
        
    },
    MIDIFile: MIDIFile
  };

}(MIDI));
