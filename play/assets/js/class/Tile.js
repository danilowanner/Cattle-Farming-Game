TileClass = Class.extend({
	
	tileConditions: [
		{
			name: "degraded",
			maxCows: 0,
			entities: [
				{name: "empty-tile", single: true, layer: 0}
			]
		},
		{
			name: "forest",
			maxCows: 0,
			entities: [
				{name: "grass-tile", single: true, layer: 0},
				{name: "forest-grass", single: true, layer: 1},
				
				{name: "forest-1", single: false, layer: 3, frequency: 1},
				{name: "forest-2", single: false, layer: 3, frequency: 1},
				{name: "forest-3", single: false, layer: 3, frequency: 1},
				
				{name: "tree-1", single: false, layer: 3, frequency: 1},
				{name: "tree-2", single: false, layer: 3, frequency: 1},
				{name: "tree-3", single: false, layer: 3, frequency: 1},
				{name: "tree-4", single: false, layer: 3, frequency: 1},
				{name: "tree-5", single: false, layer: 3, frequency: 0.2},
				{name: "tree-6", single: false, layer: 3, frequency: 0.3},
			],
		},
		{
			name: "pasture",
			maxCows: 3,
			entities: [
				{name: "grass-tile", single: true, layer: 0},
				{name: "grass-patch-1", single: false, layer: 2, frequency: 1},
				{name: "grass-patch-2", single: false, layer: 2, frequency: 0.3},
				{name: "grass-patch-3", single: false, layer: 2, frequency: 1},
				{name: "grass-object-1", single: false, layer: 2, frequency: 1},
				{name: "grass-object-2", single: false, layer: 2, frequency: 1},
				{name: "grass-object-3", single: false, layer: 2, frequency: 1},
				{name: "grass-object-4", single: false, layer: 2, frequency: 1},
				{name: "grass-object-5", single: false, layer: 2, frequency: 1}
			]
		},
		{
			name: "pasture-fertilized",
			maxCows: 3,
			entities: [
				{name: "grass-tile", single: true, layer: 0},
				{name: "grass-fertilized", single: true, layer: 0},
				{name: "grass-patch-1", single: false, layer: 2, frequency: 0.5},
				{name: "grass-patch-2", single: false, layer: 2, frequency: 0.2},
				{name: "grass-patch-3", single: false, layer: 2, frequency: 0.2},
				{name: "grass-object-1", single: false, layer: 2, frequency: 0.5},
				{name: "grass-object-2", single: false, layer: 2, frequency: 0.5},
				{name: "grass-object-3", single: false, layer: 2, frequency: 0.5},
				{name: "grass-object-4", single: false, layer: 2, frequency: 0.2},
				{name: "grass-object-5", single: false, layer: 2, frequency: 0.5}
			]
		},
		{
			name: "intensi",
			maxCows: 3,
			entities: [
				{name: "grass-tile", single: true, layer: 0},
				{name: "intensi-1", single: true, layer: 2}
			]
		},
		{
			name: "intensi-fertilized",
			maxCows: 3,
			entities: [
				{name: "grass-tile", single: true, layer: 0},
				{name: "grass-fertilized", single: true, layer: 0},
				{name: "intensi-1", single: true, layer: 1}
			]
		},
		{
			name: "restoring",
			maxCows: 0,
			entities: [
				{name: "empty-tile", single: true, layer: 0},
				{name: "grass-fertilized", single: true, layer: 0}
			]
		}
	],
	
	map: null,
	
	pos : {e:0,s:0},
	playable: null,
	visible: true,
	dirty: false,
	render: false,
	
	condition: null,
	age: 0,
	degradation: 0,
	
	entityLayer: new Array(),
	cows: new Array(),
	
	neighbours: null,
	
	selected: false,
	backupTile: null,
	changeResult: null,
	
	overlays: new Array(),

	init: function()
	{
		
	},
	
	generate: function(conditionID)
	{
		if(typeof conditionID == "string")
		{
			for(var i=0; i<this.tileConditions.length; i++)
			{
				if(this.tileConditions[i].name==conditionID) { conditionID = i; break; }
			}
		}
		
		this.condition = this.tileConditions[conditionID];
		this.condition.ID = conditionID;
		this.age = 0;
		if(this.condition.name=="intensi") this.degradation = 0;
		
		// Save Cattle Entities
		var cattle = this.removeEntities("cattle");
		
		// Create 10 empty Layers
		for(var i=0; i<10; i++) { this.entityLayer[i] = new Array(); }
		
		// Spawn Entities
		for(var k=0; k<this.condition.entities.length; k++)
		{
			var entity = this.condition.entities[k];
			
			if(entity.single)
			{
				this.addEntity(entity.layer,entity.name,this.pos);
			}
			else
			{
				var frequency = (entity.frequency!=undefined) ? entity.frequency : 1;
				var amount = Math.round(2*frequency*Math.random());
				if(frequency<1 && frequency>0) amount = Math.ceil( 1/frequency *Math.random() - 1/frequency + 1);
				for(var l=0; l<amount;l++)
				{
					var pos = {e: this.pos.e-0.4 + Math.random()*0.8, s: this.pos.s-0.4 + Math.random()*0.8};
					this.addEntity(entity.layer,entity.name,pos);
				}
			}
		}
		
		if(this.condition.name=="pasture" && this.isPlayable())
			this.addEntity(1,"grid",this.pos,"grid");
		
		// Add previously existing Cattle
		this.entityLayer[3] = this.entityLayer[3].concat(cattle);
		this.zSortEntities();
		this.dirty = true;
		this.render = true;
	},
	
	
	updateAge: function(amount)
	{
		this.age += amount;
		// Pasture Degradation
		if(this.condition.ID==2)
		{
			// Empty Pastures Recover
			if(this.cows.length==0  && this.degradation>0)
			{
				this.degradation--;
				this.removeEntities("grass-patch-2",2);
				if(this.degradation==0) this.removeEntities("grass-patch-2");
			}
			else
			{
				this.degradation += amount * this.cows.length*this.cows.length;
			}
		}
		// Visualize Pasture Degradation
		if(this.condition.ID==2)
		{
			var visualAmount = this.cows.length*this.cows.length*2;
			if(this.degradation >= 9-this.cows.length*this.cows.length) visualAmount += 5;
			
			for(var l=0; l<visualAmount;l++)
			{
				var pos = {e: this.pos.e-0.4 + Math.random()*0.8, s: this.pos.s-0.4 + Math.random()*0.8};
				this.addEntity(1,"grass-patch-2",pos);
			}
		}
		
		// Dying Cows on Degraded Field
		if(this.condition.ID==0)
		{
			while(this.cows.length>0)
			{
				this.removeCow(this.cows[0]);
			}
		}
		// Pasture turn to Degraded Field
		else if(this.degradation>=9 && this.condition.ID==2)
		{
			this.generate(0);
			SoundEngine.playSoundInstance("grass.m4a",true);
		}
		// Fertilisation Degrading
		else if(this.degradation>=10 && this.condition.ID==3)
		{
			this.generate(2);
			SoundEngine.playSoundInstance("grass.m4a",true);
		}
		// Restoring Tiles turn to restored Pasture
		else if(this.condition.ID==6)
		{
			this.degradation = 0;
			this.generate(2);
		}
	},
	
	change: function(action,reverseAction)
	{
		// Change Tile based on Action
		
		// Reverse Action (and restore tile)
		// IF selected and reverse not yet set or reverse true
		console.log("reverseAction: "+reverseAction);
		if( reverseAction==null || reverseAction )
		{
			if(this.selected)
			{
				this.changeResult = { cost: 0-this.changeResult.cost, amount: 0-this.changeResult.amount };
				
				this.restore();
				return this.changeResult;
			}
			else if(reverseAction) return false;
		}
		
		if(this.selected) return false;
		
		// ELSE Do Action
		this.changeResult = { cost: 0, amount: 1};
		switch(action)
		{
			case "buyCow":
				// return if maximal allowed cows already reached
				if(this.condition.maxCows-this.cows.length<=0) return false;
				// return if already a cow placed; only allow one cow per selection
				if(this.backupTile && this.cows.length-this.backupTile.cows.length>0) return false;
				
				this.changeResult.cost = GameEngine.treatment.cowCost();
				
				SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a");
			break;
			case "fillWithCows":
				// return if maximal allowed cows already reached
				if(this.condition.maxCows-this.cows.length<=0) return false;
				
				console.log("fwc");
				
				this.changeResult.amount = 0;
				for(var i=0; i<3-this.cows.length; i++)
				{
					console.log("add c");
					this.changeResult.cost += GameEngine.treatment.cowCost();
					this.changeResult.amount += 1;
				};
			break;
			case "sellAllOldCows":
				// return if no cows
				if(this.cows.length==0) return false;
				
				this.changeResult.amount = 0;
				for(var i=0; i<this.cows.length; i++)
				{
					var cow = this.cows[i];
					if(cow.age>=2)
					{
						this.changeResult.cost += 0-GameEngine.treatment.cowValue(2);
						this.changeResult.amount += 1;
					}
				};
			break;
			case "sellCow":
				// return if no cows
				if(this.cows.length==0) return false;
				// return if already a cow sold; only allow one cow per selection
				if(this.backupTile && this.backupTile.cows.length-this.cows.length>0) return false;
				
				this.changeResult.cost = 0-GameEngine.treatment.cowValue( this.getOldestCow().age );
				
				SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a");
			break;
			case "deforest":
				if(this.condition.ID!=1) return false;
				
				var newCondition = this.condition.ID+1;
				this.changeResult.cost = GameEngine.treatment.deforestCost;
				
				SoundEngine.playSoundInstance("tree.mp3");
				SoundEngine.playSoundInstance("tractor.m4a",true);	
			break;
			case "intensify":
				if(!(this.condition.ID==2 || this.condition.ID==3))  return false;
				if( this.degradation>4 )
				{
					this.removeEntities("tile-highlight");
					this.addEntity(1,"tile-selection-red",this.pos,"tile-highlight");
					return false;
				}
				
				var newCondition = this.condition.ID+2;
				this.changeResult.cost = GameEngine.treatment.intensifyCost;
				
				SoundEngine.playSoundInstance("hammer_"+Math.ceil(Math.random()*3)+".mp3");
			break;
			case "restore":
				if(this.cows.length>0 && this.degradation>0)
				{
					// Do not Allow if there are Cows
					this.highlightCows("red");
					this.removeEntities("tile-highlight");
					this.addEntity(1,"tile-selection-red",this.pos,"tile-highlight");
					return false;
				}
				else if((this.condition.ID==2 && this.degradation>0) || this.condition.ID==0)
				{
					// Patial Restore
					var newCondition = 6;
					this.changeResult.cost = Math.round( GameEngine.treatment.restoreCost/10*this.degradation ); 
					
					SoundEngine.playSoundInstance("grass2.m4a");
				}
				else return false;
			break;
		}
		
		// backup Tile
		this.backupTile = new Object();
			
		this.backupTile.condition = copy(this.condition);
		this.backupTile.entityLayer = copy(this.entityLayer);
		this.backupTile.cows = copy(this.cows);
		this.backupTile.getOldestCow = this.getOldestCow;
		this.backupTile.age = this.age;
		this.backupTile.degradation = this.degradation;
		
		// change Tile
		switch(action)
		{
			case "buyCow":
				this.addCow();
			break;
			case "fillWithCows":
				for(var i=0; i<this.changeResult.amount; i++)
				{
					this.addCow();
				}
			break;
			case "sellCow":
				var oldestCow = this.getOldestCow();
				this.removeCow(oldestCow);
			break;
			case "sellAllOldCows":
				for(var i=this.cows.length-1; i>=0; i--)
				{
					var cow = this.cows[i];
					if(cow.age>=2) this.removeCow(cow);
				}
			break;
			default:
				this.generate(newCondition);
				this.update();
			break;
		}
		
		this.addEntity(1,"tile-selection",this.pos,"tile-highlight");
		this.selected = true;
		
		return this.changeResult;
	},
	accept: function()
	{
		this.backupTile = false;
		this.selected = false;
	},
	restore: function()
	{
		// reverts previewed Tile changes using backupTile
		if(this.backupTile)
		{
			this.condition = this.backupTile.condition;
			this.entityLayer = this.backupTile.entityLayer;
			this.cows = this.backupTile.cows;
			this.age = this.backupTile.age;
			this.degradation = this.backupTile.degradation;
		}
		this.backupTile = false;
		this.selected = false;
		this.contaminate();
	},
	highlight: function(action)
	{
		switch(action)
		{
			case "moveCow":
				if(this.condition.maxCows-this.cows.length<=0) return false;
			break;
		}
		this.addEntity(1,"tile-selection",this.pos,"tile-highlight");
		return true;
	},
	highlightCows: function(color)
	{
		var formname = "cow-highlight";
		if(color) formname += "-"+color;
		
		for(var i=0; i<this.cows.length; i++)
		{
			var image = this.cows[i].name;
			this.addEntity(4,formname,this.cows[i].pos,"cow-highlight");
		}
	},
	showHiddenCows: function()
	{
		if(this.cows.length>0)
		{
			var neighbour = this.getNeighbours();
			
			if(neighbour.s) neighbour.s.setTreeOpacity(0.4);
			if(neighbour.w) neighbour.w.setTreeOpacity(0.4);
			if(neighbour.sw) neighbour.sw.setTreeOpacity(0.4);
		}
	},
	setTreeOpacity: function(opacity)
	{
		if(this.condition.ID==1)
		{
			var entities = this.entityLayer[3];
			
			for(var i=0; i<entities.length; i++)
			{
				var entity = entities[i];
				entity.opacity = opacity;
				this.contaminate();
			};
		}
	},
	
	addEntity: function(layer,name,pos,group)
	{
		this.entityLayer[layer].push( new EntityClass(name,pos,group) );
		this.contaminate();
	},
	
	addCow: function()
	{
		var pos = {e: this.pos.e-0.3 + Math.random()*0.6, s: this.pos.s-0.3 + Math.random()*0.6};
		var newCow = new CowClass(pos,this);
		this.entityLayer[3].push( newCow );
		this.cows.push( newCow );
		
		this.zSortEntities();
		this.showHiddenCows();
		this.contaminate();
		
		return newCow;
	},
	
	removeEntities: function(which,maxCount)
	{
		var maxCount = maxCount ? maxCount : 1000;
		// removeEntity by name [String], group [String] or Entity [Object]
		// returns removed Entities
		var removedEntities = new Array();
		for(var h=0; h<this.entityLayer.length; h++)
		{
			for(var i=this.entityLayer[h].length-1; i>=0; i--)
			{
				if(removedEntities.length>=maxCount) break;
				
				var entity = this.entityLayer[h][i];
				if(typeof (which) == 'object')
				{
					if(entity===which) { removedEntities = removedEntities.concat( this.entityLayer[h].splice(i, 1) ); }
				}
				else
				{
					if(entity.group==which) { removedEntities = removedEntities.concat( this.entityLayer[h].splice(i, 1) ); }
					else if(entity.name==which) { removedEntities = removedEntities.concat( this.entityLayer[h].splice(i, 1) ); }
				}
			}
		}
		if(removedEntities.length>0) this.contaminate();
		return removedEntities;
	},
	removeCow: function(cow)
	{
		for(var i=0; i<this.cows.length; i++)
		{
			if(this.cows[i]===cow) this.cows.splice(i, 1);
		}
		this.removeEntities(cow);
	},
	getOldestCow: function()
	{
		if(this.cows.length==0) return false;
		// Find oldest Cow to remove
		var oldestCow = null;
		for(var i=0; i<this.cows.length; i++)
		{
			if(!oldestCow || this.cows[i].age>oldestCow.age)
			{
				oldestCow = this.cows[i];
			}
		}
		return oldestCow;
	},
	
	
	zSortEntities: function()
	{
		// Sort Entities of each Layer by Depth
		for(var h=0; h<10; h++)
		{
			var zBuffer = new Array();
			for(var i=0; i<this.entityLayer[h].length; i++)
			{
				var entity = this.entityLayer[h][i];
				var zIndex =
					this.map.getCanvasCoords(entity.pos.e, entity.pos.s).y - this.map.getCanvasCoords(this.pos.e, this.pos.s).y + this.map.tileHeight;
					
					if(zIndex<=0) alert("tile Entity position exceeds zBuffer range");
								
				if(zBuffer[zIndex]==undefined)
				{
					zBuffer[zIndex] = new Array();
					
				}
				entity.z = zIndex;
				zBuffer[zIndex].push(entity);
			}
			
			var sortedEntities = new Array();
			for(var j=0; j<zBuffer.length; j++)
			{
				if(zBuffer[j]!=undefined)
				{
					for(var k=0; k<zBuffer[j].length; k++)
					{
						sortedEntities.push(zBuffer[j][k]);
					}
				}
			}
			this.entityLayer[h] = sortedEntities;
		}
	},
	
	tick: function()
	{
		this.cows.forEach(function(cow)
		{
			cow.tick();
		});
	},
	update : function()
	{
		this.getNeighbours();
		// Set grass ground texture based on neighbours, when condition == degraded or == restoring
		if(this.condition.ID == 0 || this.condition.ID == 6)
		{
			this.removeEntities("grass-over");
			var neighbour = this.neighbours;
			
			if(neighbour.n && (neighbour.n.condition.ID != 0 && neighbour.n.condition.ID != 6))
				this.addEntity(1,"grass-over-n",this.pos,"grass-over");
			if(neighbour.e && (neighbour.e.condition.ID != 0 && neighbour.e.condition.ID != 6))
				this.addEntity(1,"grass-over-e",this.pos,"grass-over");
			if(neighbour.s && (neighbour.s.condition.ID != 0 && neighbour.s.condition.ID != 6))
				this.addEntity(1,"grass-over-s",this.pos,"grass-over");
			if(neighbour.w && (neighbour.w.condition.ID != 0 && neighbour.w.condition.ID != 6))
				this.addEntity(1,"grass-over-w",this.pos,"grass-over");
		}
		
	},
	
	draw: function(layer,context)
	{
		if(this.render)
		{
			var entities = this.entityLayer[layer];
			
			for(var i=0; i<entities.length; i++)
			{
				var entity = entities[i];
				var canvasPos = this.map.getCanvasCoords(entity.pos.e,entity.pos.s,entity.subpixel);
				var x = canvasPos.x - entity.origin.x;
				var y = canvasPos.y - entity.origin.y;
				
				context.globalAlpha = entity.opacity;
				if(entity.subpixel) { context.drawImage(entity.image, x, y, entity.renderSize.x, entity.renderSize.y); }
				else { context.drawImage(entity.image, x, y); }
			};
			context.globalAlpha = 1;
		}
	},
	
	getNeighbours: function()
	{
		if(!this.neighbours)
		{
			this.neighbours = {
				n: this.map.getTile( this.pos.e, this.pos.s-1, false ),
				e: this.map.getTile( this.pos.e+1, this.pos.s, false ),
				s: this.map.getTile( this.pos.e, this.pos.s+1, false ),
				w: this.map.getTile( this.pos.e-1, this.pos.s, false ),
				sw: this.map.getTile( this.pos.e-1, this.pos.s+1, false )
			};
		}
		return this.neighbours;
	},
	isPlayable: function()
	{
		if(this.playable==null)
		{
			var s = this.pos.s;
			var e = this.pos.e;
			this.playable = (s>=this.map.fieldOrigin.s && e>= this.map.fieldOrigin.e && 
				s<this.map.fieldOrigin.s+this.map.fieldSize.s && e< this.map.fieldOrigin.e+this.map.fieldSize.e);
		}
		return this.playable;
	},
	isVisible: function(cache)
	{
		if(!cache)
		{
			this.visible = true;
			var canvasPos = this.map.getCanvasCoords(this.pos.e,this.pos.s);
			if(canvasPos.x<-this.map.tileWidth || canvasPos.y<-this.map.tileHeight) this.visible = false;
			if(canvasPos.x>RenderEngine.canvas.width+this.map.tileWidth  || canvasPos.y>RenderEngine.canvas.height+this.map.tileHeight) this.visible = false;
		}
		return this.visible;
	},
	contaminate: function()
	{
		this.dirty = true;
		this.render = true;
		
		var tile;
		for(var i=0; i<18; i++)
		{
			switch(i)
			{
				case 0: tile = this.map.getTile( this.pos.e+2, this.pos.s-2, false ); break;
				
				case 1: tile = this.map.getTile( this.pos.e+1, this.pos.s-2, false ); break;
				case 2: tile = this.map.getTile( this.pos.e+2, this.pos.s-1, false ); break;
				
				case 3: tile = this.map.getTile( this.pos.e, this.pos.s-2, false ); break;
				case 4: tile = this.map.getTile( this.pos.e+1, this.pos.s-1, false ); break;
				case 5: tile = this.map.getTile( this.pos.e+2, this.pos.s, false ); break;
				
				case 6: tile = this.map.getTile( this.pos.e, this.pos.s-1, false ); break;
				case 7: tile = this.map.getTile( this.pos.e+1, this.pos.s, false ); break;
				
				case 8: tile = this.map.getTile( this.pos.e-1, this.pos.s-1, false ); break;
				case 9: tile = this.map.getTile( this.pos.e+1, this.pos.s+1, false ); break;
				
				case 10: tile = this.map.getTile( this.pos.e-1, this.pos.s, false ); break;
				case 11: tile = this.map.getTile( this.pos.e, this.pos.s+1, false ); break;
				
				case 12: tile = this.map.getTile( this.pos.e-2, this.pos.s, false ); break;
				case 13: tile = this.map.getTile( this.pos.e-1, this.pos.s+1, false ); break;
				case 14: tile = this.map.getTile( this.pos.e, this.pos.s+2, false ); break;
				
				case 15: tile = this.map.getTile( this.pos.e-2, this.pos.s+1, false ); break;
				case 16: tile = this.map.getTile( this.pos.e-1, this.pos.s+2, false ); break;
				
				case 17: tile = this.map.getTile( this.pos.e-2, this.pos.s+2, false ); break;
			}
			if(tile) tile.render = true;
		}
	},
	boundingBox: function()
	{
		var canvasPos = this.map.getCanvasCoords(this.pos.e,this.pos.s);
		var box = 
			{
				x: canvasPos.x - this.map.tileWidth/2 - this.map.tileWidth*0.2,
				y: canvasPos.y - this.map.tileHeight*1.75,
				w: this.map.tileWidth * 1.4,
				h: this.map.tileHeight*2.5
			}
		return box;
	}
	
});