## Definitions
- MIDITools: The JS library based on the MIDIClassJS GitHub project (which is based on MIDIClassPHP), Various tools that manipulate and display midi files, simple player, simple composer 4 bar rhythm max. Only uses original sound fonts from midi.js plus one additional additional custom soundfont.
- RhythmJSON: Format I am using to serve rhythm information.
- RhythmComposer: Simple composer that is not limited to the 4 bar rhythm max of the MIDITools compser, will also use the custom soundfonts specific for my site. Future Project for RhythmComposer: Be able to read or display RhythmJSON
- RhythmDisplay: A utility script to display RhythmJSON in a user friendly format.
- RhythmPlayer: A utility script to play rhythms with custom soundfonts from a RhythmJSON format. It will use MIDITools. Can change tempo based on an input field. Can Loop. Can be tied to an instance of RhythmDisplay.
Future Project for RhythmPlayer: Eventually should be able to animate RhythmDisplay, highlighting the column that corresponds to notes being played.
- RhythmTrainer: A utility script to play rhythms with custom soundfonts from a RhythmJSON format. Tempo Training and Speed training. It will use MIDITools. Can change various aspects of rhythm being played based on input fields: tempo, sliding tempo, empty (silent) measures. Can be tied to an instance of RhythmDisplay.
Future Project for RhythmTrainer: Eventually should be able to animate RhythmDisplay, highlighting the column that corresponds to notes being played.
- iqaat.com: My site that will serve RhythmJSON, will incorporate RhythmDisplay, RythmPlayer, RhythmTrainer and be the demo site for MIDITools.
 API

* MIDISequence - high-level API for working with channels, instruments, etc.
* MIDIFile - low-level API for working with tracks
# MIDI.File

@- importBase64
@- importBinary
@- importText
@- importXML
@- exportBinary
@- exportText
@- exportXML
@- exportBase64
- exportTrackText ?

## Playback
@- play
@- stop

## Accessors
@- getTempo()
@- getBpm() ??
@- getTimebase()
@- getMsgCount(track)
@- getEventBySubtype (trackNumber, subtype)
@- exportMessageText(trackNum, msgNum)

## Manipulation
@- reset(timebase)
@- setTempo(tempo)
@- setBpm(bpm)
@- setTimebase(timebase)
@- deleteTrack(trackNumber)
@- soloTrack(trackNumber)
@- appendTextMsg(trackNumber, message)
@- insertTextMsg(trackNumber, message)
@- deleteMsg(trackNumber, messageNumber)
@- transpose(steps)
@- transposeTrack(trackNumber, steps)

# Miscellaneous 
- MIDI.drumset ?
- MIDI.drumkitList ?
- add andrew (and twitter handle) to the acknowledgements
- replace DOMLoader with custom async loader



# Contributing

Developers interested in contributing to the project can
read the library's [design document](docs/ref/design.html).

#javascript version of the _php midi class_ using midi.js#

midi.js home page is at:  http://mudcu.be/midi-js/

**The _php midi class_ can be found at:**
http://www.phpclasses.org/package/1362-PHP-Read-write-and-manipulate-MIDI-files-and-data.html

I had this class re-written in javascript as a proof of concept using the midi.js library.

It was written by a programmer named svoyski.

**CHROME browser only.**  The programmer created a custom version of midi.js
so it **IS NOT** working with the current version of CHROME.  I have it
working with Version 22.0.1229.0 m.

**It only has two instrument files:**
- 000 Acoustic Grand Piano
- 114 Steel Drums

**_"114 Steel Drums only"_ has two sounds:**
- C4 - Low Sound on Doumbek / Darbouka also known as "Doum"
- C5 - High Sound on Doumbek / Darbouka also known as "Tek"

**It has the following parts to manipulate midi files:**
- Convert type 1 MIDI to type 0
- Count duration
- Manipulate
- Show meta messages
- Convert to txt/xml
- Import from txt/xml
- Sequencer

_AND it saves any created midi files in localStorage._

*** PLEASE USE AND UPDATE!!!!!


You can find it on my website:
http://iqaat.com/music/midiclassjs/demos/sequencer.html

~Donavon
