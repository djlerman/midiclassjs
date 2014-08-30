
function EditablePattern(
				tracksTable,
				measuresInput, bpmInput, spbInput, tempoInput, repInput, nameInput,  
				instruments,
				firstNote, lastNote,
				onChange)
	{
	var ready = false;
	var data = 
		{
		mn: 1,
		bpm: 4,
		spb: 4,
		tempo: 120,
		dur: 1.7,
		name: "-",
		tracks: []
		};

	function addTrack()
		{
		var s = ""; for (var i = data.mn * data.bpm * data.spb; i--; ) s += "-";
		data.tracks.push(
					{
					on: true,
					inst: 114,
					note: firstNote,
					vol: 4,
					dur: 1.7,
					string: s
					});
		}
	
	
	measuresInput.onchange =
	bpmInput.onchange =
	spbInput.onchange =
	tempoInput.onchange =
	repInput.onchange =
	nameInput.onchange =
		function ()
			{
			changeSize();
			changed();
			};
	
	function changed() {ready && onChange && onChange();}
	
	
	function changeSize()
		{
		var oldSize = data.mn * data.bpm * data.spb;
		data.mn = measuresInput.value | 0 || data.mn;
		data.bpm = bpmInput.value | 0 || data.bpm;
		data.spb = spbInput.value | 0 || data.spb;
		data.tempo = tempoInput.value | 0 || data.tempo;
		data.name = nameInput.value || "-untitled-";
		var newSize = data.mn * data.bpm * data.spb;
		for (var ti = data.tracks.length; ti--;)
			{
			data.tracks[ti].string = data.tracks[ti].string.substring(0, newSize); 
			for (var i = oldSize; i < newSize; i++) data.tracks[ti].string += "-";
			}
		show();
		}
	
	init();
	function init()
		{
		changeSize();
		addTrack();
		addTrack();
		}
	
	//
	//
	// Create <tr>s for each track in DOM 
	//
	function show()
		{
		ready = false;
		
		var doc = tracksTable.ownerDocument;
		while (tracksTable.children.length) tracksTable.children[0].remove();
		
	//
	// Header
	//
		var tr = doc.createElement("tr");
		tr.className = "head";
		var td = doc.createElement("td"); tr.appendChild(td);
		(td = doc.createElement("td")).innerHTML = "on"; tr.appendChild(td);
		(td = doc.createElement("td")).innerHTML = "soundfont"; tr.appendChild(td);
		(td = doc.createElement("td")).innerHTML = "note"; tr.appendChild(td);
		(td = doc.createElement("td")).innerHTML = "vol"; tr.appendChild(td);
		(td = doc.createElement("td")).innerHTML = "dur"; tr.appendChild(td);
		for (var mi = 1; mi <= data.mn; mi++)
			{
			(td = doc.createElement("td")).innerHTML = "Measure " + mi;
			td.colSpan = data.bpm * data.spb;
			tr.appendChild(td);
			}
		(td = doc.createElement("td")).innerHTML = "Remove track";
		tr.appendChild(td);
		tracksTable.appendChild(tr);
		
		(tr = doc.createElement("tr")).className = "head";
		(td = doc.createElement("td")).colSpan = 6; tr.appendChild(td);
		for (var mi = 1; mi <= data.mn; mi++)
			for (var bi = 1; bi <= data.bpm; bi++)
				for (var si = 0; si < data.spb; si++)
					{
					(td = doc.createElement("td")).innerHTML = si? "-": bi;
					tr.appendChild(td);
					}
		tr.appendChild(doc.createElement("td"));
		tracksTable.appendChild(tr);
		
	//
	// Tracks
	//
		for (var ti_ = 0; ti_ < data.tracks.length; ti_++)
			(function (){
			var ti = ti_;
	// #
			(tr = doc.createElement("tr")).className = "track";
			(td = doc.createElement("td")).innerHTML = "Track #" + (ti + 1);
			tr.appendChild(td);

	// on/off
			var inp;
			var opt;
			(inp = doc.createElement("input")).type="checkbox";
			inp.checked = data.tracks[ti].on;
			inp.onclick = function(event)
				{
				data.tracks[ti].on = event.target.checked;
				changed();
				};
			(td = doc.createElement("td")).appendChild(inp); tr.appendChild(td);

	// Instrument
			inp = doc.createElement("select");
			for (var ii = 0; ii < instruments.length; ii++)
				{
				(opt = doc.createElement("option")).innerHTML = instruments[ii];
				opt.value = MIDI.GeneralMIDI.byName[instruments[ii]].number;
				inp.appendChild(opt);
				}
//			(opt = doc.createElement("option")).innerHTML = "---"; inp.appendChild(opt); ///////
			inp.value = data.tracks[ti].inst;
			inp.onchange = function(event)
				{
				data.tracks[ti].inst = event.target.value | 0;
				changed();
				};
			(td = doc.createElement("td")).appendChild(inp); tr.appendChild(td);
			
	// Note
			inp = doc.createElement("select");
			for (var n = firstNote; n <= lastNote; n++)
				{
				(opt = doc.createElement("option")).innerHTML = MIDI.noteToKey[n];
				opt.value = n;
				inp.appendChild(opt);
				}
			inp.value = data.tracks[ti].note;
			inp.onchange = function(event)
				{
				data.tracks[ti].note = event.target.value | 0;
				changed();
				};
			(td = doc.createElement("td")).appendChild(inp); tr.appendChild(td);
			
	// Volume
			inp = doc.createElement("select");
			for (var i = 1; i <= 5; i++)
				{
				(opt = doc.createElement("option")).innerHTML = i;
				opt.value = i;
				inp.appendChild(opt);
				}
			inp.value = data.tracks[ti].vol;
			inp.onchange = function(event)
				{
				data.tracks[ti].vol = event.target.value | 0;
				changed();
				};
			(td = doc.createElement("td")).appendChild(inp); tr.appendChild(td);

	// Note duration
			(inp = doc.createElement("input")).type = "text";
			inp.size = 1;
			inp.value = data.tracks[ti].dur;
			inp.onchange = function(event)
				{
				data.tracks[ti].dur = (event.target.value * 1) || 1;
				changed();
				};
			(td = doc.createElement("td")).appendChild(inp); tr.appendChild(td);
			
	// Note string
			for (var mi = 0; mi < data.mn; mi++)
				for (var bi = 0; bi < data.bpm; bi++)
					for (var si = 0; si < data.spb; si++)
						(function () {
						var i = (mi * data.bpm + bi) * data.spb + si;
						(inp = doc.createElement("input")).type="checkbox";
						inp.checked = (data.tracks[ti].string[i] == "+");
						inp.onclick = function(event)
							{
							var s = data.tracks[ti].string;
							data.tracks[ti].string = s.substring(0, i)
								+ (event.target.checked? "+": "-")
								+ s.substring(i + 1);
							changed();
							};
						(td = doc.createElement("td")).appendChild(inp);
						tr.appendChild(td);
						})();
			
	// remove track			
			(inp = doc.createElement("input")).type="button";
			inp.value = "x";
			inp.onclick = function(event)
				{
				data.tracks.splice(ti, 1);
				show();
				changed();
				};
			(td = doc.createElement("td")).appendChild(inp);
			td.style.textAlign = "right";
			tr.appendChild(td);
			
			tracksTable.appendChild(tr);
			})();
	//
	// Tracks done

	// add track			
		(tr = doc.createElement("tr")).className = "track";
		(td = doc.createElement("td")).colSpan = data.mn * data.bpm * data.spb + 6;
		tr.appendChild(td);
		(inp = doc.createElement("input")).type="button";
		inp.value = "Add track";
		inp.onclick = function(event)
			{
			addTrack();
			show();
			changed();
			};
		(td = doc.createElement("td")).appendChild(inp); tr.appendChild(td);
		tracksTable.appendChild(tr);
		
		ready = true;		
		}

	
	
	
	function loadMidi(data)
		{
		
		}
	
	function midi()
		{
		var mf = new MIDI.File();
		var track0 = [];
		track0.push({deltaTime: 0,
				type: "meta", subtype: "trackName",
				text: nameInput.value || "---"});
		track0.push({deltaTime: 0,
				type: "meta", subtype: "timeSignature",
				numerator: data.bpm,
				denominator: data.spb,
				metronome: 24,
				thirtyseconds: 8
				});
		track0.push({deltaTime: 0,
				type: "meta", subtype: "setTempo",
				microsecondsPerBeat: 240000000 / data.tempo | 0,
				});
		track0.push({deltaTime: 0,
				type: "meta", subtype: "endOfTrack",});
		mf.data().tracks.push(track0);
		
		
		for (var ti = 0; ti < data.tracks.length; ti++)
			{
			var track = [];
//			track.push({deltaTime: 0, type: "meta", subtype: "midiChannelPrefix", channel: ti});
//			track.push({deltaTime: 0, type: "channel", subtype: "controller", controllerType: 0, value: 0, channel: ti + 1});
			track.push({deltaTime: 0, type: "meta", subtype: "text", text: JSON.stringify(data.tracks[ti])});

			if (data.tracks[ti].on)
				{
				track.push({deltaTime: 0,
						type: "channel", subtype: "programChange",
						programNumber: data.tracks[ti].inst,
						channel: ti + 1});
				
				
				var strLen = data.tracks[ti].string.length;
				var reps = repInput.value | 0 || 1;
				var staff = Staff();
				
				for (var ri = reps; ri--;)
					for (var ei = data.tracks[ti].string.length; ei--; )
						if (data.tracks[ti].string[ei] === "+")
							staff.add(strLen * ri + ei, data.tracks[ti].dur, ti + 1, data.tracks[ti].note, data.tracks[ti].vol * 100 / 5);
				
				staff.add(strLen * reps);
				
				staff.pushMidi(track, 120 / data.spb | 0);
				}
			
			mf.data().tracks.push(track);
			}

		
		return mf;
		}
	
	
	
	function Staff()
		{
		var track = [];
		
		function add(pos, dur, channel, note, v)
			{
			if (dur)
				{
				var on = {pos: pos, cmd: "noteOn", channel: channel, note: note, v: v};
				var off = {pos: pos + dur, cmd: "noteOff", channel: channel, note: note, v: 0};
				on.off = off;
				off.on = on;
				track.push(on);
				track.push(off);
				}
			else
				track.push({pos: pos, cmd: "endOfTrack"});
			}

		function pushMidi(outTrack, stepSize)
			{
			track.sort(function(a, b) {return a.pos - b.pos;});
			var pos = 0;
			var notesOn = {};
			for (var ei = 0; ei < track.length; ei++)
				{
				var e = track[ei];
				if (e.done) continue;
				
				var step = Math.round((e.pos - pos) * stepSize);
				pos = e.pos;
				switch (e.cmd)
					{
				case "endOfTrack":
					outTrack.push({deltaTime: step,
						type: "meta", subtype: e.cmd});
					break;

				default:
					var cur = notesOn[e.channel * 1000 + e.note];
					if (e.v)
						{
						if (cur)
							{
							outTrack.push({deltaTime: step,
									type: "channel", subtype: cur.cmd,
									channel: cur.channel,
									noteNumber: cur.note,
									velocity: cur.v
									});
							step = 0;
							cur.done = true;
							}
						notesOn[e.channel * 1000 + e.note] = e.off;
						}
					else notesOn[e.channel * 1000 + e.note] = false;
						
				
					outTrack.push({deltaTime: step,
						type: "channel", subtype: e.cmd,
						channel: e.channel,
						noteNumber: e.note,
						velocity: e.v
						});
					}
				}
			}
		
		return {
			add: add,
			pushMidi: pushMidi
			};
		}
	
	
	
	
	return {
		init: init,
		data: function () {return data;},
		loadData: function (d)
			{
			data = d;
			measuresInput.value = data.mn;
			bpmInput.value = data.bpm;
			spbInput.value = data.spb;
			tempoInput.value = data.tempo;
			nameInput.value = data.name;
			for (var ti = data.tracks.length; ti--; )
				{
				var track = data.tracks[ti];
				track.on = !!track.on;
				track.inst = track.inst | 0 || 114;
				track.note = track.note | 0 || firstNote;
				track.vol = track.vol | 0 || 4;
				track.dur = (track.dur * 1) || 1.7;
				}
			},
		midi: midi,
		loadMidi: loadMidi,
		
		show: show,
		};
	}