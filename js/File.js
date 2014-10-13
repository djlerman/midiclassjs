
/**
 * @see {@link https://github.com/mudcube/MIDI.js  mudcube/MIDI.js}
 * @see {@link http://www.recordare.com/dtds/midixml.html  MIDI XML}
 * 
 * @file
 * 
 * <h3>Description</h3>
 * 
 * <p>The MIDI.File class supplements the mudcube/MIDI.js
 * javascript object.
 * 
 * 
 * <p>The class is intended for creating, modifying, analyzing and playing (via MIDI.Player)
 *  standard MIDI files of type 0 or 1. A MIDI song is represented 
 *  as an array of tracks, where each track is an array of messages, and each message 
 *  is a javascript object. The whole structure is compatible with the mudcube/MIDI.js scripts.
 *  
 *  <p>The class provides methods to generate and manipulate MIDI data 
 *  and to import and export binary midi files (SMF, *.mid), text in the MF2T/T2MF format 
 *  and MIDI XML.
 *  
 * 
 * <p><em>The class provides in javascript the functionality of the PHP MIDI class by fluxus@freenet.de</em>
 * <p>
 * <p>
 * 
 * <h4>Constructor</h4>
 * {@link MIDI.File MIDI.File()}<br>
 * <p>
 * 
 * <h3>Methods</h3>
 * <h4>Import</h4>
 * {@link MIDI.File#importBinary importBinary()}<br>
 * {@link MIDI.File#importText importText(text)}<br>
 * {@link MIDI.File#importXML importXML(xmlString)}<br>
 * 
 * <h4>Export</h4>
 * {@link MIDI.File#exportBinary exportBinary()}<br>
 * {@link MIDI.File#exportText exportText(relativeTS)}<br>
 * {@link MIDI.File#exportTrackText exportTrackText(trackNumber, relativeTS)}<br>
 * {@link MIDI.File#exportXML exportXML(relativeTS)}<br>
 * 
 * <h4>Player control</h4>
 * {@link MIDI.File#play play(callback)}<br>
 * {@link MIDI.File#stop stop()}<br>
 * 
 * <h4>Info</h4>
 * {@link MIDI.File#getTempo getTempo()}<br>
 * {@link MIDI.File#getBpm getBpm()}<br>
 * {@link MIDI.File#getTimebase getTimebase()}<br>
 * {@link MIDI.File#getMsgCount getMsgCount(trackNumber)}<br>
 * {@link MIDI.File#getEventBySubtype getEventBySubtype(trackNumber, subtype)}<br>
 * {@link MIDI.File#exportMsgText exportMsgText(trackNumber, messageNumber)}<br>
 * 
 * <h4>Generation/Manipulation</h4>
 * {@link MIDI.File#reset reset(timebase)}<br>
 * {@link MIDI.File#setTempo setTempo(tempo)}<br>
 * {@link MIDI.File#setBpm setBpm(bpm)}<br>
 * {@link MIDI.File#setTimebase setTimebase(timebase)}<br>
 * {@link MIDI.File#deleteTrack deleteTrack(trackNumber)}<br>
 * {@link MIDI.File#soloTrack soloTrack(trackNumber)}<br>
 * {@link MIDI.File#appendTextMsg appendTextMsg(trackNumber, message)}<br>
 * {@link MIDI.File#insertTextMsg insertTextMsg(trackNumber, message)}<br>
 * {@link MIDI.File#deleteMsg deleteMsg(trackNumber, messageNumber)}<br>
 * {@link MIDI.File#transpose transpose(steps)}<br>
 * {@link MIDI.File#transposeTrack transposeTrack(trackNumber, steps)}<br>
 * 
 * <h4>Save/Load</h4>
 * {@link MIDI.File#data data()}<br>
 * {@link MIDI.File#loadData loadData()}<br>
 *
 * 
 * <h4>MIDI object supplement</h4>
 * {@link MIDI.drumset MIDI.drumset}<br>
 * {@link MIDI.drumkitList MIDI.drumkitList}<br>
 * 
 * <br>
 * <hr>
 * <br>
 * <h3>Demos</h3>
 * 
 * Each demo exposes the player and the storage list.
 * To run a demo, first load a midi from the "Saved tunes" list 
 * or using the <a href="../demos/import.html">demos/import.html</a> demo.
 * 
 * <p>The Save button saves the current tune to the browser's local storage.
 * 
 * <p>demos/common.js subsequently contains the player and storage directory
 * code used in every demo. 
 * 
 * <ul>
 * <li>
 * <a href="../demos/manipulate.html">demos/manipulate.html</a>
 * demonstrates manipulation of MIDI data (imported MIDI file) in various ways
 * 
 * <li>
 * <a href="../demos/sequencer.html">demos/sequencer.html</a>
 * A little online sequencer, 4 drum tracks, 4 instrument tracks, 1 bar only.
 * <p>The mix data is saved within the MIDI as Text messages.
 *  Subsequently, as a MIDI with such Text messages gets loaded,
 *  the sequencer restores the patterns.
 *  <p>Though all the instruments are available in the selectors, 
 *  the MIDI.Player used to play the mix will play only the loaded soundfonts.
 *  Specify soundfonts to load in the demos/common.js file under the "var instruments =" line.
 * 
 * <li>
 * <a href="../demos/import.html">demos/import.html</a>
 * demonstrates text (MF2T/T2MF format) and MIDI XML import.
 * 
 * <li>
 * <a href="../demos/export.html">demos/export.html</a>
 * demonstrates export to text (MF2T/T2MF format) and MIDI XML.
 * 
 * <li>
 * <a href="../demos/meta.html">demos/meta.html</a>
 * shows content of all meta events in a MIDI file.
 * These events are often used for song title, copyright informations etc.
 * (like ID3 tags in mp3 files).
 * 
 * <li>
 * <a href="../demos/duration.html">demos/duration.html</a>
 * demonstrates how to find the duration of a MIDI file.
 * 
 * <li>
 * <a href="../demos/convert.html">demos/convert.html</a>
 * converts MIDI files of type 1 to type 0.
 * </ul> 
 * <br>
 * <hr>
 * <br>
 * <h3>Compatibility</h3>
 * Browsers supported:
 * <ul>
 * <li>
 * Google chrome only.
 * </ul>
 * <br>
 * <hr>
 * <br>
 * 
 */



/**
 * @external MIDI
 * @see {@link https://github.com/mudcube/MIDI.js  mudcube/MIDI.js}
 * @namespace
 * 
 * 
 */
if (typeof (MIDI) === "undefined") var MIDI = {};



/**
 * Creates an instance of MIDI.File object.
 * 
 * @classdesc
 * @memberof! MIDI  
 * @constructor
 * @param {Number} timebase (default = 480)
 * @example
 * var mfile = new MIDI.File();
 * @returns {MIDI.File}
 * 
 */
	
MIDI.File = function (timebase)
	{
	var data;
	
	/**
	 * Resets the song to the ititial state.
	 * @param {Number} timebase (default = 480)
	 * @example
	 * mfile.reset(240);
	 */
	this.reset = function(timebase)
		{
		data =
			{
			header:
				{
				formatType: 0,
				ticksPerBeat: timebase || 480
				},
			tracks: []
			};
		};
		
	this.reset(timebase);
	
	/**
	 * Returns the song data in a Javascript object.
	 * The data is compatible with MIDI.js/jasmid player.
	 * @returns {Object}
	 * @example
	 * //
	 * // Change the timebase directly:
	 * mfile.data().header.ticksPerBeat = 240;
	 * //
	 * // Save to localStorage:
	 * 	localStorage["mySong"] = JSON.stringify(mfile.data());
	 */
	this.data = function () {return data;};
	
	/**
	 * Data should be compatible with MIDI.js/jasmid player.
	 * No checks are made here.
	 * @example
	 * //
	 * // Load from localStorage:
	 * //
	 * mfile.loadData(JSON.parse(localStorage["mySong"]));
	 */
	this.loadData = function (d) {data = d;};
	

	function totalTime()
		{
		var data = MIDI.Player.data;
		var tt = 0.5;
		for (var n = data.length; n--; ) tt += data[n][1];
		return tt;
		};		
	
	/**
	 * Using MIDI.Player to play the sequence.
	 * The callback function, if specified, is called for each note
	 * being processed.
	 * 
	 * @param {Function} callback The event parameter passed to the callback function is: 
	 * 		{
	 * 		channel: channelNumber,
	 *		note: noteNumber,
	 *		now: currentTime,
	 *		end: endTime,
	 *		message: message,
	 *		velocity: velocity
	 *		}	
	 * 
	 * @example
	 * mfile.play(function(event)
	 * 	{
	 * 	updateProgressBar(event.now / event.end);
	 * 	showNote(MIDI.noteToKey[event.note]);
	 * 	});
	 */
	this.play = function (callback)
		{
		MIDI.Player.stop();
		callback && MIDI.Player.setAnimation(callback);
		MIDI.Player.currentData = data;
		MIDI.Player.replayer = new Replayer(data, 1);
		MIDI.Player.data = MIDI.Player.replayer.getData();
		MIDI.Player.endTime = totalTime();
//
// Currently MIDI.Player doesn't support programChange event.
//	Just setting the instruments before playing.
//  Hopefully there is no more then one programChange per channel.
		
		for (var ti = data.tracks.length; ti--; )
			for (var ei = data.tracks[ti].length; ei--; )
				if (data.tracks[ti][ei].subtype == "programChange")
					MIDI.programChange(data.tracks[ti][ei].channel, data.tracks[ti][ei].programNumber);
		
		callback && MIDI.Player.addListener(callback);
		MIDI.Player.start();
		};
		
	/**
	 * Stop MIDI.Player.
	 * @example
	 * mfile.stop();
	 */		
	this.stop = function ()
		{
		MIDI.Player.stop();
		};
	
		
		
	/** Gets the first event of the given subtype from the given track. 
	 * @param {Number} trackNumber
	 * @param {String} subtype Some possible values:
	 * "text", "copyrightNotice",
	 * "trackName", "instrumentName", "lyrics"
	 * @returns {Object}
	 * @example
	 * //
	 * // Try to find the trackName event in the leading track. 
	 * //
	 * var nameEvent = mfile.getEventBySubtype(0, "trackName");
	 * document.getElementById("song name").value =
	 * 	nameEvent? nameEvent.text: "untitled"; 
	 */
	this.getEventBySubtype = function (trackNumber, subtype)
		{
		var track = data.tracks[trackNumber];
		if (!track) return undefined;
		for (var ei = 0; ei < track.length; ei++)
			if (track[ei].subtype == subtype)
				return track[ei];
		return undefined;
		};
		

	/** Sets tempo by replacing or adding set tempo msg in track #0. 
	 * @param {Number} tempo
	 */
	this.setTempo = function (tempo)
		{
		if (!(tempo = parseInt(tempo))) return;
		var newTrack = false;
		if (newTrack = !data.tracks.length) this.addTrack();
		
		var msg = this.getEventBySubtype(0, "TimeSig");
		if (!msg) this.appendTextMsg(0, "0 TimeSig 4/4 24 8");
		
		msg = this.getEventBySubtype(0, "setTempo");
		if (msg) msg.microsecondsPerBeat = tempo;
		else this.appendTextMsg(0, "0 Tempo " + tempo);
		
		if (newTrack) this.appendTextMsg(0, "0 Meta TrkEnd");
		};
		
	/** Returns tempo set in track #0. 
	 * @returns {Number}
	 */
	this.getTempo = function ()
		{
		if (!data.tracks.length) return 0;
		var tempoMsg = this.getEventBySubtype(0, "setTempo");
		return tempoMsg? tempoMsg.microsecondsPerBeat: 0;
		};
		
	/** Sets tempo corresponding to given bpm. 
	 * @param {Number} bpm
	 */
	this.setBpm = function (bpm)
		{
		this.setTempo(Math.round(60000000 / bpm));
		};
		
	/** Returns bpm corresponding to tempo. 
	 * @returns {Number}
	 */
	this.getBpm = function ()
		{
		var tempo = this.getTempo();
		return tempo? (60000000 / tempo): 0;
		};
		
	/** Sets timebase. 
	 * @param {Number} timebase
	 */
	this.setTimebase = function (timebase)
		{
		data.header.ticksPerBeat = timebase;
		};
		
	/** Gets timebase. 
	 * @returns {Number} timebase
	 */
	this.getTimebase = function ()
		{
		return data.header.ticksPerBeat;
		};
		
						
		
	
	/**
	 * @private
	 * @param {Number} n
	 * @param {Number} len
	 * @returns {String} Binary string of {len} bytes
	 */
	function int2bytes(n, len)
		{
		var s = "";
		for (var i = len; i--; ) s += String.fromCharCode((n >> (i * 8)) & 0xFF);
		return s;
		}
	
	/**
	 * @private
	 * @param {Number} n
	 * @returns {String} Binary string of {len} bytes. MIDI-style variable length integer.
	 */
	function int2varBytes(n)
		{
		n |= 0;
		var s = String.fromCharCode(n & 0x7F);
		while (n >>= 7) s = String.fromCharCode((n & 0x7F) | 0x80) + s;
		return s;
		}
	

	
	var subtypes =
		{
		sequenceNumber:		{type: "meta",	id: 0x00,	txt: "Seqnr",				xml: "SequenceNumber"},
		text:						{type: "meta",	id: 0x01,	txt: "Meta Text",			xml: "TextEvent"},
		copyrightNotice:		{type: "meta",	id: 0x02,	txt: "Meta Copyright",	xml: "CopyrightNotice"},
		trackName:				{type: "meta",	id: 0x03,	txt: "Meta TrkName",	xml: "TrackName"},
		instrumentName:		{type: "meta",	id: 0x04,	txt: "Meta InstrName",	xml: "InstrumentName"},
		lyrics:					{type: "meta",	id: 0x05,	txt: "Meta Lyric",			xml: "Lyric"},
		marker:					{type: "meta",	id: 0x06,	txt: "Meta Marker",		xml: "Marker"},
		cuePoint:				{type: "meta",	id: 0x07,	txt: "Meta Cue",			xml: "CuePoint"},
		midiChannelPrefix:		{type: "meta",	id: 0x20,	txt: "Meta 0x20",			xml: "MIDIChannelPrefix"},
		midiChannelPrefixOrPort: {type: "meta", id: 0x21, txt: "Meta 0x21",	xml: "MIDIChannelPrefixOrPort"},
		endOfTrack:			{type: "meta",	id: 0x2f,	txt: "Meta TrkEnd",		xml: "EndOfTrack"},
		setTempo:				{type: "meta",	id: 0x51,	txt: "Tempo",				xml: "SetTempo"},
		smpteOffset:			{type: "meta",	id: 0x54,	txt: "SMPTE",				xml: "SMPTEOffset"},
		timeSignature:			{type: "meta",	id: 0x58,	txt: "TimeSig",				xml: "TimeSignature"},
		keySignature:			{type: "meta",	id: 0x59,	txt: "KeySig",				xml: "KeySignature"},
		sequencerSpecific:	{type: "meta",	id: 0x7f,	txt: "SeqSpec",			xml: "SequencerSpecific"},
		
		noteOff:					{type: "channel",	id: 0x08,	txt: "Off",				xml: "NoteOff"},
		noteOn:					{type: "channel",	id: 0x09,	txt: "On",				xml: "NoteOn"},
		noteAftertouch:		{type: "channel",	id: 0x0a,	txt: "PoPr",				xml: "PolyKeyPressure"},
		controller:				{type: "channel",	id: 0x0b,	txt: "Par",				xml: "ControlChange"},
		programChange:		{type: "channel",	id: 0x0c,	txt: "PrCh",				xml: "ProgramChange"},
		channelAftertouch:	{type: "channel",	id: 0x0d,	txt: "ChPr",				xml: "ChannelKeyPressure"},
		pitchBend:				{type: "channel",	id: 0x0e,	txt: "Pb",				xml: "PitchBendChange"},
		
		sysEx:					{type: "sysEx",	id: 0xf0,	txt: "SysEx",			xml: "SystemExclusive"},
//		dividedSysEx:			{type: "dividedSysEx", id: 0xf7, txt: "SysEx",		xml: "SystemExclusive"},
		
		};
	
	var txt2subtype = {};
	var id2subtype = {};
	var xml2subtype = {};
	for (var i in subtypes)
		txt2subtype[subtypes[i].txt] = 
		id2subtype[subtypes[i].id] = 
		xml2subtype[subtypes[i].xml] = 
			i;
	

	
	var lastEventTypeByte;
	
	/**
	 * Returns the MIDI.File contents in a binary string in SMF format.
	 *
	 * @return {String} 
	 * @example
	 * //
	 * // Make the link to download binary file.
	 * // Use btoa() to convert binary string to base64.
	 * //
	 * document.getElementById("dl").href="data:audio/midi;base64,"
	 *  + btoa(mfile.exportBinary());
	 * document.getElementById("dl").download = "test.mid";
	 */
	this.exportBinary = function ()
		{
		var bin = "MThd\0\0\0\6\0"
			+ String.fromCharCode((data.tracks.length > 1)? 1: 0)
			+ int2bytes(data.tracks.length, 2)
			+ int2bytes(data.header.ticksPerBeat, 2);
		for (var ti = 0; ti < data.tracks.length; ti++)
			{
			bin += "MTrk";
			var tbin = "";
			var track = data.tracks[ti];
			var time = 0;
			lastEventTypeByte = false;
			
			for (var ei = 0; ei < track.length; ei++)
				{
				var event = track[ei];
				tbin += int2varBytes(event.deltaTime);
				switch (event.type)
					{
//
//						system/meta events
//
				case "meta":
					if (subtypes[event.subtype] === undefined)
						throw "Bad meta subtype: " + event.subtype;
				
					tbin += int2bytes(0xff, 1);
					tbin += int2bytes(subtypes[event.subtype].id, 1);
					
					switch (event.subtype)
						{
					case "midiChannelPrefix":
						tbin += int2varBytes(1);
						tbin += int2bytes(event.channel, 1);
						break;
					case "endOfTrack":
						tbin += int2varBytes(0);
						break;
					case "setTempo":
						tbin += int2varBytes(3);
						tbin += int2bytes(event.microsecondsPerBeat, 3);
						break;
					case "smpteOffset":
						tbin += int2varBytes(5);
						tbin += int2bytes({
									24: 0x00,
									25: 0x20,
									29: 0x40,
									30: 0x60
									}[event.frameRate] | event.hour, 1);
						tbin += int2bytes(event.min, 1);
						tbin += int2bytes(event.sec, 1);
						tbin += int2bytes(event.frame, 1);
						tbin += int2bytes(event.subframe, 1);
						break;
					case "timeSignature":
						tbin += int2varBytes(4);
						tbin += int2bytes(event.numerator, 1);
						tbin += int2bytes(Math.log(event.denominator)/Math.LN2, 1);
						tbin += int2bytes(event.metronome, 1);
						tbin += int2bytes(event.thirtyseconds, 1);
						break;
					case "keySignature":
						tbin += int2varBytes(2);
						tbin += int2bytes((event.key < 0)? (event.key + 256): event.key, 1);
						tbin += int2bytes(event.scale, 1);
						break;
					default:
						if (event.text !== undefined)
							{
							tbin += int2varBytes(event.text.length);
							tbin += event.text;
							}
						else if (event.data !== undefined)
							{
							tbin += int2varBytes(event.data.length);
							tbin += event.data;
							}
						else if (event.number !== undefined)
							{
							tbin += int2varBytes(2);
							tbin += int2bytes(event.number, 2);
							}
						else
							throw "Bad meta subtype: " + event.subtype;
						}
					break;
					
				case "sysEx":
				case "dividedSysEx":
					tbin += int2bytes(subtypes[event.type].id, 1);
					tbin += int2varBytes(event.data.length);
					tbin += event.data;
					break;

//
//	channel events
//
				case "channel":
					if (subtypes[event.subtype] === undefined)
						throw "Bad channel subtype";
				
					var b = event.channel | (subtypes[event.subtype].id << 4);
//						if ((b !== lastEventTypeByte) || (b & 0x80))
						tbin += int2bytes(b, 1);
					lastEventTypeByte = b;

					switch (event.subtype)
						{
					case "noteOff":
					case "noteOn":
						tbin += int2bytes(event.noteNumber, 1);
						tbin += int2bytes(event.velocity, 1);
						break;
					case "noteAftertouch":
						tbin += int2bytes(event.noteNumber, 1);
						tbin += int2bytes(event.amount, 1);
						break;
					case "controller":
						tbin += int2bytes(event.controllerType, 1);
						tbin += int2bytes(event.value, 1);
						break;
					case "programChange":
						tbin += int2bytes(event.programNumber, 1);
						break;
					case "channelAftertouch":
						tbin += int2bytes(event.amount, 1);
						break;
					case "pitchBend":
						tbin += int2bytes(event.value & 0x7F, 1);
						tbin += int2bytes(((event.value & 0xffff) >> 7)  & 0x7F, 1);
						break;
					default:
						throw "Bad channel subtype";
						}
					
					break;
					}
				}
			
			bin += int2bytes(tbin.length, 4);
			bin += tbin;
			}
		return bin;
		};

	/**
	 * Loads the SMF format binary string.
	 * Uses jasmid/midifile.js
	 * @requires jasmid/midifile.js
	 * 
	 * jasmid/midifile.js binary import negative pitch bend fix:
	 * insert line 224: 
	 * 		if (event.value & 0x2000) event.value -= 0x3fff + 1;
	 * 
	 * @example
	 * 
	 * // Use split(",") to cut off "data:audio/midi;base64,"
	 * // and atob() to decode base64.
	 * 
	 * var input = "data:audio/midi;base64,TVRoZAAAA ... v8vAA==";
	 * mfile.importBinary(atob(input.split(",")[1]));
	 */
	this.importBinary = function (blob) {data = MidiFile(blob);};

	

	/**
	 * Exports the MIDI.File contents to MF2T/T2MF format.
	 * 
	 * @param {Boolean} relativeTS true for relative timestamps, false for absolute.
	 * @returns {String}
	 */
	this.exportText = function(relativeTS)
		{
		var s = "MFile " + ((data.tracks.length > 1)? "1 ": "0 ")
				+ data.tracks.length + " " + data.header.ticksPerBeat + "\n";
		for (var ti = 0; ti < data.tracks.length; ti++)
			s += this.exportTrackText(ti, relativeTS);
		return s;
		};
	
	/**
	 * Exports the track to MF2T/T2MF format.
	 * 
	 * @param {Number} trackNumber
	 * @param {Boolean} relativeTS true for relative timestamps, false for absolute.
	 * @returns {String}
	 */
	this.exportTrackText = function (trackNumber, relativeTS)
		{
		var track = data.tracks[trackNumber];
		var s = "MTrk\n";
		var time = 0;
		if (relativeTS) s += "TimestampType=Delta\n";
		for (var ei = 0; ei < track.length; ei++)
			{
			var event = track[ei];
			time += event.deltaTime;
			s += relativeTS? event.deltaTime: time;
			s += exportMsgText(event);
			s += "\n";
			}
		return s += "TrkEnd\n";
		};

	
	/**
	 * Exports the message to MF2T/T2MF format. Attension: timestamps are exported as relative. 
	 * 
	 * @param {Number} trackNumber
	 * @param {Number} messageNumber
	 * @returns {String}
	 */
	this.exportMsgText = function (trackNumber, messageNumber)
		{
		var event = data.tracks[trackNumber];
		if (!event) throw "No such track: " + trackNumber;
		event = event[messageNumber];
		if (!event) throw "No such message: " + trackNumber + "/" + messageNumber;
		return event.deltaTime + exportMsgText(event);
		};
	
	function exportMsgText(event)
		{
		var s = " ";
		switch (event.type)
			{
//
//				system/meta events
//
		case "meta":
			if (subtypes[event.subtype] === undefined)
				throw "Bad meta subtype: " + event.subtype;
		
			s += subtypes[event.subtype].txt;
			
			switch (event.subtype)
				{
			case "midiChannelPrefix":
				s += " " + ("0" + event.channel).substr(-2);
				break;
			case "endOfTrack":
				break;
			case "setTempo":
				s += " " + event.microsecondsPerBeat;
				break;
			case "smpteOffset":
				s += " " + ({
							24: 0x00,
							25: 0x20,
							29: 0x40,
							30: 0x60
							}[event.frameRate] | event.hour)
						+ " " + event.min
						+ " " + event.sec
						+ " " + event.frame
						+ " " + event.subframe;
				break;
			case "timeSignature":
				s += " " + event.numerator + "/"
//							+ Math.log(event.denominator)/Math.LN2
						+ event.denominator
						+ " " + event.metronome
						+ " " + event.thirtyseconds;   /////!!!
				break;
			case "keySignature":
				s += " " + event.key + (event.scale? " minor": " major");
				break;
			default:
				if (event.text !== undefined)
					s += " \"" + event.text.replace(/"/g, "'") + "\"";
				else if (event.data !== undefined)
					s += hex(event.data);
				else if (event.number !== undefined)
					s += " " + event.number;
				else
					throw "Bad meta subtype: " + event.subtype;
				}
			break;
			
		case "sysEx":
		case "dividedSysEx":
			s += "SysEx" + hex(event.data);
			break;
			
//
//channel events
//
		case "channel":
			if (subtypes[event.subtype] === undefined)
				throw "Bad channel subtype";
		
			s += subtypes[event.subtype].txt + " ch=" + event.channel;

			switch (event.subtype)
				{
			case "noteOff":
			case "noteOn":
				s += " n=" + event.noteNumber + " v=" + event.velocity;
				break;
			case "noteAftertouch":
				s += " n=" + event.noteNumber + " v=" + event.amount;
				break;
			case "controller":
				s += " c=" + event.controllerType + " v=" + event.value;
				break;
			case "programChange":
				s += " p=" + event.programNumber;
				break;
			case "channelAftertouch":
				s += " v=" + event.amount;
				break;
			case "pitchBend":
				s += " v=" + event.value;
				break;
			default:
				throw "Bad channel subtype";
				}
			
			break;
			}
		return s;
	
		function hex(bytes)
			{
			var s = "";
			for (var i = 0; i < bytes.length; i++)
				s += " "+ ("0" + bytes.charCodeAt(i).toString(16)).substr(-2);
			return s;
			}
		}
		
		
	
	
	/**
	 * Loads the MF2T/T2MF text.
	 * If a line "TimestampType=Delta" is found at the beginning of a track (next line after "MTrk"),
	 * all timestamps of this track are interpreted as relative (delta) values,
	 * otherwise as absolute values. 
	 * 
	 * @param {String} text
	 */
	this.importText = function (text)
		{
		var tracks = text.split(/MTrk[\r\n]+/);
		
		var a = tracks[0].split(/[\r\n]+/)[0].split(/\s+/);
		if (a[0] != "MFile") throw "Bad header";
		data.header =
			{
			formatType: 0,
			ticksPerBeat: a[3] | 0
			};
		data.tracks = [];
		
		if ((tracks.length - 1) != parseInt(a[2])) throw "Wrong track count";
		
		for (var ti = 1; ti < tracks.length; ti++)
			data.tracks.push(getTextTrack(tracks[ti]));
		
		data.header.formatType = (data.tracks.length > 1)? 1: 0; 
		return;
		
		function getTextTrack(text)
			{
			var track = [];
			var lines = text.split(/[\r\n]+/);
			var li = (lines[0] == "MTrk")? 1: 0;
			var str;
			var delta = false;
			var last = 0;
			while (str = lines[li++])
				{
				if (str == "TrkEnd") break;
				if (str == "TimestampType=Delta")
					{
					delta = true;
					continue;
					}
				
				var event = importEventText(str);
				if (!delta) event.deltaTime = Math.max(event.deltaTime - last, 0);
				last += event.deltaTime;
				track.push(event);
				}
			return track;
			}
		};

	/**
	 * Inserts the message into the track. Attension: the timestamp is treated as absolute. 
	 * 
	 * @param {Number} trackNumber
	 * @param {String} message The message in MF2T/T2MF format
	 * @returns {Number} 0-based number of the new message
	 * @example
	 * //
	 * // Insert 2 notes at the beginning of the track
	 * //	 
	 * mfile.insertTextMsg(3, "0 On ch=1 n=60 v=100");
	 * mfile.insertTextMsg(3, "60 Off ch=1 n=60 v=0");
	 * mfile.insertTextMsg(3, "60 On ch=1 n=72 v=100");
	 * mfile.insertTextMsg(3, "120 Off ch=1 n=72 v=0");
	 */
	this.insertTextMsg = function (trackNumber, message)
		{
		var track = data.tracks[trackNumber];
		if (!track) throw "No such track: " + trackNumber;
		var event = importEventText(message);
		var time = 0;
		for (var ei = 0; ei < track.length; ei++)
			{
			if ((time + track[ei].deltaTime) > event.deltaTime) break;
			time += track[ei].deltaTime;
			}
		if (ei) event.deltaTime -= time;
		if (ei < track.length) track[ei].deltaTime -= event.deltaTime; 
		track.splice(ei, 0, event);
		return ei;
		};

	/**
	 * Appends the message to the track. Attension: the timestamp is treated as relative. 
	 * 
	 * @param {Number} trackNumber
	 * @param {String} message The message in MF2T/T2MF format
	 * @returns {Number} 0-based number of the new message
	 * @example
	 * //
	 * // Append 2 notes to the end of the track
	 * //	 
	 * mfile.appendTextMsg(3, "60 On ch=1 n=60 v=100");
	 * mfile.appendTextMsg(3, "60 Off ch=1 n=60 v=0");
	 * mfile.appendTextMsg(3, "0 On ch=1 n=72 v=100");
	 * mfile.appendTextMsg(3, "60 Off ch=1 n=72 v=0");
	 */
	this.appendTextMsg = function (trackNumber, message)
		{
		var track = data.tracks[trackNumber];
		if (!track) throw "No such track: " + trackNumber;
		var ei = track.length;
		if (ei && (track[ei - 1].subtype == "endOfTrack")) ei--;
		track.splice(ei, 0, importEventText(message));
		return ei;
		};
		

	
	/**
	 * Deletes the message. 
	 * 
	 * @param {Number} trackNumber
	 * @param {Number} messageNumber
	 */
	this.deleteMsg = function (trackNumber, messageNumber)
		{
		var track = data.tracks[trackNumber];
		if (!track) throw "No such track: " + trackNumber;
		var event = track[messageNumber];
		if (!event) throw "No such message: " + trackNumber + "/" + messageNumber;
		if (messageNumber + 1 < track.length)
			track[messageNumber + 1].deltaTime += track[messageNumber].deltaTime;
		track.splice(messageNumber, 1);
		};
		
	function importEventText(str)
		{
		var line = str.replace(/Meta\s+/, "Meta:").split(/\s+/);
		var event = {};
		if ((event.deltaTime = parseInt(line[0])) === NaN) throw "Bad timestamp: " + line[0];

		event.subtype = txt2subtype[line[1].replace(":", " ")];
		if (!event.subtype) throw "Unknown event: " + str;
		event.type = subtypes[event.subtype].type;
		
		if (event.type == "channel")
			{
			var pars = {};
			for (var pi = 2; pi < line.length; pi++)
				{
				var v = line[pi].split("=");
				if ((v.length != 2) || ((pars[v[0]] = parseInt(v[1])) === NaN))
					throw "Bad parameter: " + line[pi] + " (" + str + ")";
				}
			event.channel = pars.ch;
			}
		
		switch (event.subtype)
			{
		case "sequenceNumber":
			event.channel = line[2] | 0;
			break;
		case "setTempo":
			event.microsecondsPerBeat = line[2] | 0;
			break;
		case "smpteOffset":
			var hourByte = line[2] | 0;
			event.frameRate =
				{
				0x00 : 24,
				0x20 : 25,
				0x40 : 29,
				0x60 : 30
				}[hourByte & 0x60];
			event.hour = hourByte & 0x1f;
			event.min = line[3] | 0;
			event.sec = line[4] | 0;
			event.frame = line[5] | 0;
			event.subframe = line[6] | 0;
			break;
		case "timeSignature":
			var a = line[2].split("/");
			event.numerator = a[0] | 0;
			event.denominator = a[1] | 0;
			event.metronome = line[3] | 0;
			event.thirtyseconds = line[4] | 0;						
			break;
		case "keySignature":
			event.key = line[2] | 0;
			event.scale = (line[3] == "major")? 0: 1;
			break;
		case "midiChannelPrefix":
		case "midiChannelPrefixOrPort":
			event.channel = line[2] | 0;
			break;
		case "text":
		case "copyrightNotice":
		case "trackName":
		case "instrumentName":
		case "lyrics":
		case "marker":
		case "cuePoint":
			var mm = str.match(/\s"(.*)"$/) || str.match(/\s'(.*)'$/);
			if (!mm || (mm.length != 2)) throw "Bad text: " + str;
			event.text = mm[1];
			break;
		case "endOfTrack":
			break;
			
		case "sequencerSpecific":
		case "sysEx":
		case "dividedSysEx":
			event.data = "";
			for (var pi = 2; pi < line.length; pi++)
				event.data += String.fromCharCode(parseInt(line[pi], 16));
			break;
		
		case "noteOff":
		case "noteOn":
			event.noteNumber = pars.n;
			event.velocity = pars.v;
			if (!event.velocity) event.subtype = "noteOff";
			break;
		case "controller":
			event.controllerType = pars.c;
			event.value = pars.v;
			break;
		case "noteAftertouch":
			event.noteNumber = pars.n;
			event.amount = pars.v;
			break;
		case "programChange":
			event.programNumber = pars.p;
			break;
		case "channelAftertouch":
			event.amount = pars.v;
			break;
		case "pitchBend":
			event.value = pars.v;
			break;
			
		default:
			throw "Unknown event: " + str;
			}
		
		return event;
		}
		
		
		
	/**
	 * 
	 * 
	 * @param {Boolean} xmlString Input string in MIDI XML format
	 */
	this.importXML = function (xmlString)
		{
		var doc = (new DOMParser).parseFromString(xmlString, "application/xml");
		if (!doc) return;
		for (var node = doc.firstChild; node; node = node.nextSibling)
			if (node.localName == "MIDIFile")
				{
				this.reset();
				var tracksCount = 0;
				for (var node = node.firstChild; node; node = node.nextSibling)
					switch (node.localName)
						{
					case "TrackCount":
						tracksCount = parseInt(node.textContent);
						break;
					case "TicksPerBeat":
						data.header.ticksPerBeat = parseInt(node.textContent);	
						break;
					case "Track":
						data.tracks.push(parseXMLTrack(node));
						break;
						}
				if (tracksCount != data.tracks.length) throw "Wrong track count";
				data.header.formatType = (data.tracks.length > 1)? 1: 0; 
				return;
				}
		throw "No MIDIFile node found";
		
		
		function parseXMLTrack(node)
			{
			var track = [];
			var lastTime = 0;
			var subtype;
			for (var enode = node.firstChild; enode; enode = enode.nextSibling)
				if (enode.localName == "Event")
					{
					var event = {deltaTime: 0};
					for (var vnode = enode.firstChild; vnode; vnode = vnode.nextSibling)
					switch (vnode.localName)
						{
					case "Absolute":
						event.deltaTime = Math.max(parseInt(vnode.textContent) - lastTime, 0);
						lastTime = parseInt(vnode.textContent);
						break;
					case "Delta":
						event.deltaTime = parseInt(vnode.textContent);
						break;
					case null:
						break;
					default:
						event.subtype = xml2subtype[vnode.localName];
						if (!event.subtype) throw "Unknown event: " + vnode.localName;
						event.type = subtypes[event.subtype].type;

						var pars = {};
						for (var cnode = vnode.firstChild; cnode; cnode = cnode.nextSibling)
							pars[cnode.nodeName] = cnode.textContent;
						for (var ai = vnode.attributes.length; ai--; )
							pars[vnode.attributes[ai].name] = vnode.attributes[ai].textContent;
							
						function checkInt(n)
							{
							var v = parseInt(pars[n]);
							if (v === NaN) throw event.subtype + ", " + n + ": number expected, found: " + v;
							return v;
							}
						
						if (event.type == "channel") event.channel = checkInt("Channel");
						
						switch (event.subtype)
							{
						case "sequenceNumber":
							event.channel = checkInt("#text");
							break;
						case "setTempo":
							event.microsecondsPerBeat = checkInt("Value");
							break;
						case "smpteOffset":
							var hourByte = checkInt("Hour");
							event.frameRate =
								{
								0x00 : 24,
								0x20 : 25,
								0x40 : 29,
								0x60 : 30
								}[hourByte & 0x60];
							event.hour = hourByte & 0x1f;
							event.min = checkInt("Minute");
							event.sec = checkInt("Second");
							event.frame = checkInt("Frame");
							event.subframe = checkInt("FractionalFrame");
							break;
						case "timeSignature":
							event.numerator = checkInt("Numerator");
							event.denominator = Math.pow(2, checkInt("LogDenominator"));
							event.metronome = checkInt("MIDIClocksPerMetronomeClick");
							event.thirtyseconds = checkInt("ThirtySecondsPer24Clocks");
							break;
						case "keySignature":
							event.key = checkInt("Fifths");
							event.scale = checkInt("Mode");
							break;
						case "midiChannelPrefix":
						case "midiChannelPrefixOrPort":
							event.channel = checkInt("Value");
							break;
						case "text":
						case "copyrightNotice":
						case "trackName":
						case "instrumentName":
						case "lyrics":
						case "marker":
						case "cuePoint":
							event.text = vnode.textContent;
							break;
						case "endOfTrack":
							break;
							
						case "SysEx":
						case "dividedSysEx":
						case "sequencerSpecific":
							var line = pars["#text"].split(/\s+/);
							event.data = "";
							for (var pi = 0; pi < line.length; pi++)
								if (line[pi]) event.data += String.fromCharCode(parseInt(line[pi], 16));
							break;
						
						case "noteOff":
						case "noteOn":
							event.noteNumber = checkInt("Note");
							event.velocity = checkInt("Velocity");
							if (!event.velocity) event.subtype = "noteOff";
							break;
						case "controller":
							event.controllerType = checkInt("Control");
							event.value = checkInt("Value");
							break;
						case "noteAftertouch":
							event.noteNumber = checkInt("Note");
							event.amount = checkInt("Pressure");
							break;
						case "programChange":
							event.programNumber = checkInt("Number");
							break;
						case "channelAftertouch":
							event.amount = checkInt("Pressure");
							break;
						case "pitchBend":
							event.value = checkInt("Value");
							break;
							}							
						break;
						}
					track.push(event);
					}
			
			return track;
			}
		};

	
	
	/**
	 * Exports the MIDI.File contents to MIDI XML format.
	 * 
	 * @param {Boolean} relativeTS true for relative timestamps, false for absolute.
	 * @returns {String}
	 */
	this.exportXML = function (relativeTS)
		{
		var s = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n"
			+ "<!DOCTYPE MIDIFile PUBLIC\n"
			+ "\t\"-//Recordare//DTD MusicXML 0.9 MIDI//EN\"\n"
			+ "\t\"http://www.musicxml.org/dtds/midixml.dtd\">\n"
			+ "<MIDIFile>\n"
			+ "<Format>" + ((data.tracks.length > 1)? "1": "0") + "</Format>\n"
			+ "<TrackCount>" + data.tracks.length + "</TrackCount>\n"
			+ "<TicksPerBeat>" + data.header.ticksPerBeat + "</TicksPerBeat>\n"
			+ "<TimestampType>" + (relativeTS? "Delta": "Absolute") + "</TimestampType>\n";
		
		for (var ti = 0; ti < data.tracks.length; ti++)
			{
			s += "<Track Number=\"" + ti + "\">\n";
			
			var track = data.tracks[ti];
			var time = 0;

			for (var ei = 0; ei < track.length; ei++)
				{
				var event = track[ei];
				time += event.deltaTime;
				
				s += "\t<Event>\n";
				s += relativeTS? ("\t\t<Delta>" + event.deltaTime + "</Delta>\n"): ("\t\t<Absolute>" + time + "</Absolute>\n");
				
				switch (event.type)
					{
//
//						system/meta events
//
				case "meta":
					if (subtypes[event.subtype] === undefined)
						throw "Bad meta subtype: " + event.subtype;
				
					s += "\t\t<" + subtypes[event.subtype].xml;
					
					switch (event.subtype)
						{
					case "midiChannelPrefix":
						s += " Value=\"" + ("0" + event.channel).substr(-2) + "\"/>"; 
						break;
					case "endOfTrack":
						s += "/>";
						break;
					case "setTempo":
						s += " Value=\"" + event.microsecondsPerBeat + "\"/>";
						break;
					case "smpteOffset":
						s += " TimeCodeType=\"1\" Hour=\""
								 + ({
									24: 0x00,
									25: 0x20,
									29: 0x40,
									30: 0x60
									}[event.frameRate] | event.hour)
								+ "\" Minute=\"" + event.min
								+ "\" Second=\"" + event.sec
								+ "\" Frame=\"" + event.frame
								+ "\" FractionalFrame=\"" + event.subframe + "\"/>"; 
						break;
					case "timeSignature":
						s += " Numerator=\"" + event.numerator
								+ "\" LogDenominator=\"" + (Math.log(event.denominator)/Math.LN2)
								+ "\" MIDIClocksPerMetronomeClick=\"" + event.metronome
								+ "\" ThirtySecondsPer24Clocks=\"" + event.thirtyseconds + "\"/>"; 
						break;
					case "keySignature":
						s += " Fifths=\"" + event.key
								+ "\" Mode=\"" + event.scale + "\"/>";
						break;
					default:
						if (event.text !== undefined)
							{
							s += ">" + escapeHtml(event.text) + "</" + subtypes[event.subtype].xml + ">";
							}
						else if (event.data !== undefined)
							{
							s += ">";
							for (var i = 0; i < event.data.length; i++)
								s += " " + event.data.charCodeAt(i).toString(16);
							s += "</" + subtypes[event.subtype].xml + ">";
							}
						else if (event.number !== undefined)
							{
							s += " Value=\"" + event.number + "\"/>";
							}
						else
							throw "Bad meta subtype: " + event.subtype;
						}
					break;
					
				case "sysEx":
				case "dividedSysEx":
					s += "<SystemExclusive>";
					for (var i = 0; i < event.data.length; i++)
						s += event.data.charCodeAt(i).toString(16) + " ";
					s += "</SystemExclusive>"; 
					break;

//
//	channel events
//
				case "channel":
					if (subtypes[event.subtype] === undefined)
						throw "Bad channel subtype";
					
					s += "\t\t<" + subtypes[event.subtype].xml + " Channel=\"" + event.channel + "\"";

					switch (event.subtype)
						{
					case "noteOff":
					case "noteOn":
						s += " Note=\"" + event.noteNumber + "\" Velocity=\"" + event.velocity + "\"/>";
						break;
					case "noteAftertouch":
						s += " Note=\"" + event.noteNumber + "\" Pressure=\"" + event.amount + "\"/>";
						break;
					case "controller":
						s += " Control=\"" + event.controllerType + "\" Value=\"" + event.value + "\"/>";
						break;
					case "programChange":
						s += " Number=\"" + event.programNumber + "\"/>";
						break;
					case "channelAftertouch":
						s += " Pressure=\"" + event.amount + "\"/>";
						break;
					case "pitchBend":
						s += " Value=\"" + event.value + "\"/>";
						break;
					default:
						throw "Bad channel subtype";
						}
					
					break;
					}
				
				s += "\n\t</Event>\n";
				}
			s += "</Track>\n";
			}
		return s += "</MIDIFile>\n";	
		};


	/**
	 * transposes all notes of the track by the given number (positive or negative) of half tone steps.
	 * @param {Number} trackNumber
	 * @param {Number} steps
	 * @example
	 * //
	 * // Up by octave
	 * //	 
	 * mfile.transposeTrack(2, 12);
	 */
	this.transposeTrack = function(trackNumber, steps)
		{
		var track = data.tracks[trackNumber];
		if (!track) throw "No such track: " + trackNumber;
		for (var ei = track.length; ei--; )
			if ((track[ei].subtype == "noteOff") || (track[ei].subtype == "noteOn"))
				track[ei].noteNumber = Math.max(Math.min(track[ei].noteNumber + steps, 127), 0);
		};
		

	/**
	 * transposes song by the given number (positive or negative) of half tone steps.
	 * @param {Number} steps
	 * @example
	 * //
	 * // Down by octave
	 * //	 
	 * mfile.transposeTrack(2, -12);
	 */
	this.transpose = function(steps)
		{
		for (var ti = data.tracks.length; ti--; )
			this.transposeTrack(ti, steps);
		};

		
	/**
	 * Adds new empty track, returns its track number.
	 * @returns {Number}
	 */
	this.addTrack = function()
		{
		data.tracks.push([]);
		data.header.formatType = (data.tracks.length > 1)? 1: 0;
		return data.tracks.length - 1;
		};
		
		
	/**
	 * Deletes the track.
	 * @param {Number} trackNumber
	 * @example
	 * mfile.deleteTrack(2);
	 */
	this.deleteTrack = function(trackNumber)
		{
		if (trackNumber >= data.tracks.length) throw "No such track: " + trackNumber;
		data.tracks.splice(trackNumber, 1);
		data.header.formatType = (data.tracks.length > 1)? 1: 0; 
		};

		
	/**
	 * Deletes all tracks except one. 
	 * @param {Number} trackNumber
	 * @example
	 * mfile.soloTrack(2);
	 */
	this.soloTrack = function(trackNumber)
		{
		if (trackNumber >= data.tracks.length) throw "No such track: " + trackNumber;
		data.tracks = trackNumber? [data.tracks[0], data.tracks[trackNumber]]: [data.tracks[0]];
		data.header.formatType = 0; 
		};

				
		
	/**
	 * Returns number of messages of the track.
	 * @param {Number} trackNumber
	 * @returns {Number}
	 * @example
	 * alert("Track #2 message count: " + mfile.getMsgCount(2));
	 */
	this.getMsgCount = function(trackNumber)
		{
		if (trackNumber >= data.tracks.length) throw "No such track: " + trackNumber;
		data.tracks.splice(trackNumber, 1);
		};
		
	
	function escapeHtml(s)
		{
		return s
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
		}		
	
	};


/**
 * The associative array (Object) of standard gm drum kit names 
 * @example
 * //
 * // Create the drum selector in a HTML document
 * //
 *	var sel = document.createElement("select");
 *	for (var i in MIDI.drumkitList)
 *		{
 *		var opt = document.createElement("option");
 *		opt.innerHTML = MIDI.drumkitList[i];
 *		opt.value = i;
 *		sel.appendChild(opt);
 *		}
 */
MIDI.drumkitList = 
	{
	1: "Dry",
	9: "Room",
	19: "Power",
	25: "Electronic",
	33: "Jazz",
	41: "Brush",
	57: "SFX",
	128: "Default"		
	};

/**
 * The associative array (Object) of drumset instrument names 
 * @example
 * alert(MIDI.drumset[35]); //Acoustic Bass Drum
 */
MIDI.drumset = 
	{
	35: "Acoustic Bass Drum",
	36: "Bass Drum 1",
	37: "Side Stick",
	38: "Acoustic Snare",
	39: "Hand Clap",
	40: "Electric Snare",
	41: "Low Floor Tom",
	42: "Closed Hi-Hat",
	43: "High Floor Tom",
	44: "Pedal Hi-Hat",
	45: "Low Tom",
	46: "Open Hi-Hat",
	47: "Low Mid Tom",
	48: "High Mid Tom",
	49: "Crash Cymbal 1",
	50: "High Tom",
	51: "Ride Cymbal 1",
	52: "Chinese Cymbal",
	53: "Ride Bell",
	54: "Tambourine",
	55: "Splash Cymbal",
	56: "Cowbell",
	57: "Crash Cymbal 2",
	58: "Vibraslap",
	59: "Ride Cymbal 2",
	60: "High Bongo",
	61: "Low Bongo",
	62: "Mute High Conga",
	63: "Open High Conga",
	64: "Low Conga",
	65: "High Timbale",
	66: "Low Timbale",
	67: "High Agogo",
	68: "Low Agogo",
	69: "Cabase",
	70: "Maracas",
	71: "Short Whistle",
	72: "Long Whistle",
	73: "Short Guiro",
	74: "Long Guiro",
	75: "Claves",
	76: "High Wood Block",
	77: "Low Wood Block",
	78: "Mute Cuica",
	79: "Open Cuica",
	80: "Mute Triangle",
	81: "Open Triangle"
	};
	
