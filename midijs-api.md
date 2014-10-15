## MIDI.loadPlugin.js
Decides which framework is best to use, and sends request.
~~~
// interface to download soundfont, then execute callback;
MIDI.loadPlugin(callback, soundfont);
~~~

~~~
// simple example to get started;
MIDI.loadPlugin(function() {
	MIDI.noteOn(0, 100, 127, 0); // plays note once loaded
}, "soundfont/soundfont-ogg-guitar.js");
~~~

## MIDI.Soundfont.js
Customizable base64 Soundfont.

Encode your own soundfonts, Drums, Guitars, and so on.
You are listening to Fluid (R3) General MIDI SoundFont (GM).


## MIDI.Plugin.js

Ties together the following frameworks;

~~~
MIDI.noteOn(channel, note, velocity, delay);
MIDI.noteOff(channel, note, delay);
MIDI.chordOn(channel, chord, velocity, delay);
MIDI.chordOff(channel, chord, delay);
MIDI.keyToNote = object; // A0 => 21
MIDI.noteToKey = object; // 21 => A0
~~~

## MIDI.Player.js
Streams the MIDI to the browser.

~~~
MIDI.Player.currentTime = integer; // time we are at now within the song.
MIDI.Player.endTime = integer; // time when song ends.
MIDI.Player.playing = boolean; // are we playing? yes or no.
MIDI.Player.loadFile(file, callback); // load .MIDI from base64 or binary XML request.
MIDI.Player.start(); // start the MIDI track (you can put this in the loadFile callback)
MIDI.Player.resume(); // resume the MIDI track from pause.
MIDI.Player.pause(); // pause the MIDI track.
MIDI.Player.stop(); // stops all audio being played, and resets currentTime to 0.
Callback whenever a note is played;

MIDI.Player.removeListener(); // removes current listener.
MIDI.Player.addListener(function(data) { // set it to your own function!
	var now = data.now; // where we are now
	var end = data.end; // time when song ends
	var channel = data.channel; // channel note is playing on
	var message = data.message; // 128 is noteOff, 144 is noteOn
	var note = data.note; // the note
	var velocity = data.velocity; // the velocity of the note
	// then do whatever you want with the information!
});

Smooth animation, interpolates between onMidiEvent calls;
MIDI.Player.clearAnimation(); // clears current animation.
MIDI.Player.setAnimation(function(data) {
	var now = data.now; // where we are now
	var end = data.end; // time when song ends
	var events = data.events; // all the notes currently being processed
	// then do what you want with the information!
});
~~~

## DOMLoader.js
Loads scripts in synchronously, or asynchronously.

~~~
DOMLoader.script.add(src, callback);
DOMLoader.XMLHttp.js:  Cross-browser XMLHttpd request.
~~~
### DOMLoader.sendRequest(config)

~~~
config {
  url: the url of the resource,
  data: set to true for a content-type request of application/x-wwww-form-urlencoded,
  onerror: callback for errors (same parameters as XMLHttpRequest.onerror),
  onprogress: called on progress updates  (same parameters as XMLHttpRequest.onprogress),
  onload: called when complete (req is parameter)
}
~~~