SoundEngineClass = Class.extend({
	
	mySource: null,
	audioContext: null,
	soundClips: {},
	
	setup: function ()
	{
		if (typeof AudioContext !== "undefined") {
			this.audioContext = new AudioContext();
		} else if (typeof webkitAudioContext !== "undefined") {
			this.audioContext = new webkitAudioContext();
		} else {
		    throw new Error('AudioContext not supported. :(');
		}
		
		this.load("jungle_short.m4a", function(SoundClip) { SoundClip.volume = 0.3; SoundClip.play(true); });
		this.load("Scabeater_Searching.mp3", function(SoundClip) { SoundClip.volume = 0.7; SoundClip.play(true); });
		
		this.load("grass.m4a",function(SoundClip) { SoundClip.volume = 0.4; });
		this.load("grass2.m4a",function(SoundClip) { SoundClip.volume = 0.2; });
		this.load("tree.mp3",function(SoundClip) { SoundClip.volume = 0.4; });
		this.load("cow_1.m4a",function(SoundClip) { SoundClip.volume = 0.1; });
		this.load("cow_2.m4a",function(SoundClip) { SoundClip.volume = 0.1; });
		this.load("cow_3.m4a",function(SoundClip) { SoundClip.volume = 0.1; });
		this.load("cow_4.m4a",function(SoundClip) { SoundClip.volume = 0.2; });
		this.load("cow_5.m4a",function(SoundClip) { SoundClip.volume = 0.2; });
		this.load("coins.m4a",function(SoundClip) { SoundClip.volume = 0.8; });
		this.load("tractor.m4a",function(SoundClip) { SoundClip.volume = 0.8; });
	},
	
	load: function(file, callbackFcn)
	{
		if(this.soundClips[file])
		{
			callbackFcn(this.soundClips[file]);
			return this.soundClips[file];
		}
		
		var clip = new SoundClip(file);
		this.soundClips[file] = clip;
	
		var request = new XMLHttpRequest();
		request.open('GET', "assets/sounds/"+file, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			// this.audioContext.createBuffer(request.response, false); // Synchronous alternative
			SoundEngine.audioContext.decodeAudioData(request.response, 
			function(buffer)
			{
				clip.buffer = buffer;
				clip.loaded = true;
				callbackFcn(clip); 
			},
			function(data)
			{
				console.log("decoding Audio failed");
			});
			
		}
		request.send();
		
		return clip;
	},
	
	playSound: function(file,settings)
	{
		var looping = false;
		var volume = 0.5;
		if(settings)
		{
			if(settings.looping)
				looping = settings.looping;
			if(settings.volume)
				volume = settings.volume;
		}
		
		var sd = this.soundClips[file];
		if(sd == null) return false;
		if(sd.l == false) return false;
			
		var clipSource = this.audioContext.createBufferSource();
		clipSource.buffer = sd.b;
		clipSource.gain.value = volume;
		clipSource.connect(this.audioContext.destination);
		clipSource.loop = looping;
		clipSource.noteOn(0);
		return true;
	},
	
	playSoundInstance: function(file,single)
	{
		if(!SoundEngine.audioContext) return false;
		var sound = SoundEngine.load(file, function(soundClip) { soundClip.play(false,single); });
	},
	stopSoundInstance: function(file,single)
	{
		if(!SoundEngine.audioContext) return false;
		var sound = SoundEngine.load(file, function(soundClip) { soundClip.fadeOut(); });
	}
	
});

//----------------------------
SoundClip = Class.extend({
	file: null,
	loaded: false,
	buffer: null,
	loop: false,
	volume: 0.2,
	source: null,
	playing: false,
	playTimer: null,
	
	//----------------------------
	init: function(fileName) {
		this.file = fileName;
	},
	//----------------------------
	play: function(loop,single) {
		if(!SoundEngine.audioContext) return false;
		
		console.log("play "+this.file);
		this.loop = loop;
		
	    if(this.loaded)
	    {
	    	if( !this.playing || !single)
	    	{
	    		this.source = SoundEngine.audioContext.createBufferSource();
				
				this.source.buffer = this.buffer;
				this.source.gain.value = this.volume;
				this.source.connect(SoundEngine.audioContext.destination);
				this.source.loop = this.loop;
				
				var sc = this;
				this.source.onended = function()
				{
					sc.playing = false;
				}//this.playTimer = setTimeout(function() { sc.playing = false; }, Math.round(this.source.buffer.duration*1000));
				
				this.source.noteOn(0);
				this.playing = true;
			}
		    
		    return true;
	    }
	},
	stop: function() {
		this.source.disconnect();
		this.source = null;
		this.playing = false;
		clearTimeout(this.playTimer);
	},
	fadeOut: function()
	{
		var me = this;
		if(this.playing)
		{
			var fade = function() {
				me.source.gain.value -= 0.06;
				if (me.source.gain.value>0.1)
				{
					setTimeout(fade, 50);
				}
				else
				{
					me.stop();
				}
			}
			fade();
		}
	}
});


var SoundEngine = new SoundEngineClass();