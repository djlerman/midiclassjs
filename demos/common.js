


var storage =
	{
	files:		"midi_demos_files: ",
	};


var instruments =
	[
	"acoustic_grand_piano",
//	"synth_drum",
//	"church_organ",
	"steel_drums", // test
	];

function el(id) {return document.getElementById(id);}

MIDI.loader =
	{
	start: function(onstart, message)
		{
		el("output").innerHTML = message;
		},
	message: function (message, onstart)
		{
		el("output").innerHTML = message;
		},
	update: function (id, message, percent)
		{
		if (percent !== undefined) message += " (" + percent + "%)";
		el("output").innerHTML = message;
		},
	stop: function()
		{
		el("output").innerHTML = "";
		}
	};


function makeTry(f)
	{
	for (var args = [], ai = 1; ai < arguments.length; ai++) args.push(arguments[ai]);
	try {f.apply(this, args);}
	catch (e) {el("status").innerHTML = "Error: " + e;}
	}

function init()
	{
	showDir("dir");
	player = new Player("start", "stop", "dl", "name", "save", "currentTracks", "currentEvents", "status", "saved");
	player.enable(false);
	player.show();
	
	el("status").innerHTML = "loading...";

	MIDI.loadPlugin(
		{
		soundfontUrl: "../soundfont/",
		instruments: instruments,
		callback : function()
			{
			MIDI.loader.stop();
			el("status").innerHTML = "ready";
			player.enable(true);
			}
		});
	};

function showDir(elname)
	{
	var dir =
		{
		convert: "Convert type 1 MIDI to type 0",
		duration: "Count duration",
		manipulate: "Manipulate",
		meta: "Show meta messages",
		export: "Convert to txt/xml",
		import: "Import from txt/xml",
		sequencer: "Sequencer"
		};
	
	for (var di in dir)
		{
		var li = document.createElement("li");
		if (document.location.href.indexOf("/" + di + ".html") < 0)
			{
			var a = document.createElement("a");
			a.innerHTML = dir[di];
			a.href = di + ".html";
			li.appendChild(a);
			}
		else
			li.innerHTML = dir[di];
		el(elname).appendChild(li);
		}
	return;
	};



function Player(start, stop, dl, name, save, currentTracks, currentEvents, status, saved)
	{
	var el =
		{
		start: document.getElementById(start),
		stop: document.getElementById(stop),
		dl: document.getElementById(dl),
		name: document.getElementById(name),
		save: document.getElementById(save),
		currentTracks: document.getElementById(currentTracks),
		currentEvents: document.getElementById(currentEvents),
		status: document.getElementById(status),
		saved: document.getElementById(saved)
		};
	this.el = el;
	var _this = this;
	el.start.onclick = function() {_this.play();};
	el.stop.onclick = function() {_this.stop();};
	el.save.onclick = function()
		{
		localStorage[storage.files + el.name.value] = JSON.stringify(_this.mfile.data());
		_this.show();
		};
	
	this.mfile = new MIDI.File();
	
	this.show = function()
		{
		var n = 0;
		for (var ti = this.mfile.data().tracks.length; ti--; ) n += this.mfile.data().tracks[ti].length;
		el.currentTracks.innerHTML = this.mfile.data().tracks.length;
		el.currentEvents.innerHTML = n;
		
		
		while (el.saved.children.length) el.saved.children[0].remove();
		
		var tr;
		var td;
		(tr = document.createElement("tr")).className = "head";
		(td = document.createElement("td")).innerHTML = "trackName"; tr.appendChild(td);
		(td = document.createElement("td")).innerHTML = "tracks"; tr.appendChild(td);
		(td = document.createElement("td")); tr.appendChild(td);
		el.saved.appendChild(tr);
		
		for (var n in localStorage)
			if (n.indexOf(storage.files) === 0)
				(function () {
				var fn = n;
				var name = n.substring(storage.files.length);
				var data = JSON.parse(localStorage[n]);
				var tr = document.createElement("tr");
				tr.className = "line";
				var td;
				(td = document.createElement("td")).innerHTML = name; tr.appendChild(td);
				(td = document.createElement("td")).innerHTML = data.tracks.length; tr.appendChild(td);
				
				var btn;
				(btn = document.createElement("input")).type="button";
				btn.value = "load";
				btn.onclick = function()
					{
					_this.mfile.loadData(JSON.parse(localStorage[fn]));				
					var nameEvent = _this.mfile.getEventBySubtype(0, "trackName");
//					_this.setName(nameEvent? nameEvent.text: "untitled");
					_this.setName(name);
					_this.show();
					if (_this.onLoad) _this.onLoad();
					};
				td = document.createElement("td");
				td.appendChild(btn);
				
				(btn = document.createElement("input")).type="button";
				btn.value = "remove";
				btn.onclick = function()
					{
					delete localStorage[fn];
					_this.show();
					};
				td.appendChild(btn);
				tr.appendChild(td);
	
				el.saved.appendChild(tr);
				})();
		};
		
	this.enable = function(enabled)
		{
		el.start.disabled = !enabled;
		el.stop.disabled = true;
		};
		
	this.setName = function(name)
		{
		el.name.value = name;
		};
		
	this.play = function()
		{
		this.mfile.play(playing);
		playstr = "playing: ";
		el.status.innerHTML = "started";
		el.stop.disabled = false;
		};
		
	this.stop = function()
		{
		this.mfile.stop();
		el.status.innerHTML = "stopped";
		el.stop.disabled = true;
		};
	
	var playstr;
	function playing(data)
		{
		if (data.note && data.velocity)
			el.status.innerHTML = ((playstr += "-" + MIDI.noteToKey[data.note]).length > 111)?
					("... " + playstr.substr(-111)):
					playstr;
		if (data.now >= data.end)
			{
			el.status.innerHTML = "ready";
			el.stop.disabled = true;
			if (_this.onEnd) _this.onEnd();
			}
		}	
	}



	
	