CowClass = EntityClass.extend({
	
	forms: {
		250: {
			"cow-old-n": {image:"250_cow-old-n.png", origin: {x: 22, y: 30} },
			"cow-old-e": {image:"250_cow-old-e.png", origin: {x: 22, y: 30} },
			"cow-old-s": {image:"250_cow-old-s.png", origin: {x: 22, y: 30} },
			"cow-old-w": {image:"250_cow-old-w.png", origin: {x: 22, y: 30} },
			"cow-n": {image:"250_cow-n.png", origin: {x: 22, y: 30} },
			"cow-e": {image:"250_cow-e.png", origin: {x: 22, y: 30} },
			"cow-s": {image:"250_cow-s.png", origin: {x: 22, y: 30} },
			"cow-w": {image:"250_cow-w.png", origin: {x: 22, y: 30} },
			"calf-n": {image:"250_calf-n.png", origin: {x: 22, y: 30} },
			"calf-e": {image:"250_calf-e.png", origin: {x: 22, y: 30} },
			"calf-s": {image:"250_calf-s.png", origin: {x: 22, y: 30} },
			"calf-w": {image:"250_calf-w.png", origin: {x: 22, y: 30} }
		},
		150: {
			"cow-old-n": {image:"150_cow-old-n.png", origin: {x: 13, y: 18} },
			"cow-old-e": {image:"150_cow-old-e.png", origin: {x: 13, y: 18} },
			"cow-old-s": {image:"150_cow-old-s.png", origin: {x: 13, y: 18} },
			"cow-old-w": {image:"150_cow-old-w.png", origin: {x: 13, y: 18} },
			"cow-n": {image:"150_cow-n.png", origin: {x: 13, y: 18} },
			"cow-e": {image:"150_cow-e.png", origin: {x: 13, y: 18} },
			"cow-s": {image:"150_cow-s.png", origin: {x: 13, y: 18} },
			"cow-w": {image:"150_cow-w.png", origin: {x: 13, y: 18} },
			"calf-n": {image:"150_calf-n.png", origin: {x: 13, y: 18} },
			"calf-e": {image:"150_calf-e.png", origin: {x: 13, y: 18} },
			"calf-s": {image:"150_calf-s.png", origin: {x: 13, y: 18} },
			"calf-w": {image:"150_calf-w.png", origin: {x: 13, y: 18} }
		},
	},
	
	age: 0,
	tile: null,
	direction: "none",
	
	init: function (pos,tile)
	{
		if(!(pos && tile))
		{
			console.log("Invisible Cow created");
			return;
		}
		
		var formname;
		var rand = Math.ceil(Math.random()*4);
		switch(rand)
		{
			case 1: formname = "calf-n"; break;
			case 2: formname = "calf-e"; break;
			case 3: formname = "calf-s"; break;
			case 4: formname = "calf-w"; break;
		}
		var group = "cattle";
		this.parent(formname,pos,group);
		
		this.tile = tile;
	},
	
	tick: function ()
	{
		
	},
	update: function ()
	{
		if(this.age>1)
		{
			switch(this.name)
			{
				case "calf-n":
				case "cow-n": this.change("cow-old-n");
				break;
				case "calf-e":
				case "cow-e": this.change("cow-old-e");
				break;
				case "calf-s":
				case "cow-s": this.change("cow-old-s");
				break
				case "calf-w":
				case "cow-w": this.change("cow-old-w");
				break;
			}
			this.tile.contaminate();
		}
		else if(this.age>0)
		{
			switch(this.name)
			{
				case "calf-n": this.change("cow-n");
				break;
				case "calf-e": this.change("cow-e");
				break;
				case "calf-s": this.change("cow-s");
				break;
				case "calf-w": this.change("cow-w");
				break;
			}
			this.tile.contaminate();
		}
	}
});