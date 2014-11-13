# API

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
