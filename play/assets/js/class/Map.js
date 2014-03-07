MapClass = Class.extend({

	worldSize: { e: 16, s: 16 },
	fieldSize: { e: 8, s: 8 },
	fieldOrigin: null,
	
	width: null,
	height: null,
	
	tileWidth: 250,
	tileHeight: 145,
	tiles: null,
	fieldTiles: null,
	tileConditions: null,
	zBuffer: null,
	
	
	mapOrigin: {x:0 ,y: 0},
	
	setup: function ()
	{
		this.fieldOrigin = { e: Math.floor((this.worldSize.e-this.fieldSize.e)/2), s: Math.floor((this.worldSize.s-this.fieldSize.s)/2) }
		
		
		this.width = this.tileWidth/2 * (this.fieldSize.e + this.fieldSize.s);
		this.height =  this.tileHeight/2 * (this.fieldSize.e + this.fieldSize.s);
		
		// Set tile size according to Device
		if(RenderEngine.canvasScale < 1.6 && window.innerWidth*1.5 < this.width/RenderEngine.canvasScale)
		{
			this.tileWidth = 150;
			this.tileHeight = 87;
			
			this.width = this.tileWidth/2 * (this.fieldSize.e + this.fieldSize.s);
			this.height =  this.tileHeight/2 * (this.fieldSize.e + this.fieldSize.s);
		}
		
		if(GameEngine.nativeScrolling)
		{
			// Set Canvas Size to contain play field
			RenderEngine.resize(
				Math.max( (this.width+20), RenderEngine.canvas.width) /RenderEngine.canvasScale,
				Math.max( (this.height+this.tileHeight/2), RenderEngine.canvas.height) /RenderEngine.canvasScale
				);
		}
		
		// Disable native scrolling if Canvas is more than 50% wider than window
		if(RenderEngine.canvas.width/RenderEngine.canvasScale > window.innerWidth*1.4)
		{
			GameEngine.nativeScrolling = false;
			RenderEngine.resize(window.innerWidth,window.innerHeight);
		}
		
		
		// world origin, center Map
		fieldX = (RenderEngine.canvas.width-this.width)/2;
		fieldY = RenderEngine.canvas.height/2;
		
		if(GameEngine.nativeScrolling)
		{
			this.mapOrigin.x = Math.round( fieldX - this.tileWidth/2 * (this.fieldOrigin.e+this.fieldOrigin.s) );
			this.mapOrigin.y = fieldY;
		}
		else
		{
			this.mapOrigin.x = Math.round( 0-this.width/2);
			this.mapOrigin.y = fieldY;
		}
	},
	
	generate: function(pastureTileNum)
	{
		var i = 0;
		this.tiles = new Array();
		this.fieldTiles = new Array();
		
		// generate Map Tiles (random outside; all forest on playable tiles)
		for(s=0; s<this.worldSize.s; s++)
		{
			for(e=0; e<this.worldSize.e; e++)
			{
				this.tiles[i] = new TileClass();
				this.tiles[i].pos = {e: e+0.5, s: s+0.5};
				this.tiles[i].map = this;
				
				
				var condition = Math.random()<0.4 ? "pasture" : "forest";
				this.tiles[i].generate(condition);
				
				// add to fieldTiles if inside field Area
				if( this.tiles[i].isPlayable() )
				{
					this.fieldTiles.push(this.tiles[i]);
					if(condition!="forest") this.tiles[i].generate("forest");
				}
				i++;
			}
		}
		
		var generateRandom = false;
		if(generateRandom)
		{
			// place random pasture on playfield
			var randomFieldTile = this.fieldTiles[ Math.floor(Math.random()*this.fieldTiles.length) ];
			randomFieldTile.generate("pasture");
			
			// let pastures on playfield grow
			var conditionName = "pasture";
			var tileCount = this.worldSize.s*this.worldSize.e;
			
			var fieldTileCount = this.fieldSize.s*this.fieldSize.e;
			
			var currentCount = 1;
			
			while(currentCount<pastureTileNum)
			{
				var k = Math.floor( Math.random()*fieldTileCount );
				if(this.fieldTiles[k]!=undefined && this.fieldTiles[k].condition.name==conditionName)
				{
					var neighbours = this.fieldTiles[k].getNeighbours();
					for(var index in neighbours)
					{
						if(neighbours[index] && (neighbours[index].condition.name!=conditionName))
						{
							neighbours[index].generate(conditionName);
							if(neighbours[index].isPlayable()) currentCount++;
							if(currentCount==pastureTileNum) break;
						}
					}
				}
			}
		}
		else
		{
			// Always Generate same Playfield
			this.fieldTiles[56].generate("pasture");
			
			// let pastures on playfield grow
			var conditionName = "pasture";
			var conditionPercent = 20;
			var tileCount = this.worldSize.s*this.worldSize.e;
			
			var fieldTileCount = this.fieldSize.s*this.fieldSize.e;
			
			var currentCount = 1;
			
			while(currentCount<pastureTileNum)
			{
				$.each(this.fieldTiles, function(key,tile)
				{
					if(currentCount==pastureTileNum) return;
					if(tile!=undefined && tile.condition.name==conditionName)
					{
						var neighbours = tile.getNeighbours();
						for(var index in neighbours)
						{
							if(neighbours[index] && (neighbours[index].condition.name!=conditionName))
							{
								neighbours[index].generate(conditionName);
								if(neighbours[index].isPlayable()) currentCount++;
								if(currentCount==pastureTileNum) break;
							}
						}
					}
				});
			}
		}
		
		
		// Create Depth Buffer
		this.zBuffer = new Array();
		for(var i=0; i<this.tiles.length; i++)
		{
			var tile = this.tiles[i];
			var zIndex = this.worldSize.e - Math.floor(tile.pos.e) + Math.floor(tile.pos.s) + 100;
				if(zIndex<=0) alert("world exceeds zBuffer range");
			
			if(this.zBuffer[zIndex]==undefined)
			{
				this.zBuffer[zIndex] = new Array();
				
			}
			this.zBuffer[zIndex].push(tile);
		}
		
		this.updateTiles();
		console.log("Map generated");
	},
	
	
	tick: function()
	{
		this.tiles.forEach(function(tile)
		{
			tile.tick();
		});
	},
	updateTiles: function()
	{
		for(var i=0; i<this.tiles.length; i++)
		{
			this.tiles[i].update();
		}
	},
	restoreTiles: function()
	{
		for(var i=0; i<this.tiles.length; i++)
		{
			this.tiles[i].restore();
		}
	},
	acceptTiles: function()
	{
		for(var i=0; i<this.tiles.length; i++)
		{
			this.tiles[i].accept();
		}
	},
	ageTiles: function(amount)
	{
		// Increase the age of each tile by amount
		for(var i=0; i<this.tiles.length; i++)
		{
			this.tiles[i].updateAge(amount);
		}	
	},
	removeHighlights: function()
	{
		for(var i=0; i<this.tiles.length; i++)
		{
			this.tiles[i].removeEntities("tile-highlight");
		}
	},
	highlightCows: function()
	{
		for(var i=0; i<this.fieldTiles.length; i++)
		{
			this.fieldTiles[i].highlightCows();
		}
	},
	removeCowHiglights: function()
	{
		for(var i=0; i<this.fieldTiles.length; i++)
		{
			this.fieldTiles[i].removeEntities("cow-highlight");
		}
	},
	showHiddenCows: function()
	{
		for(var i=0; i<this.fieldTiles.length; i++)
		{
			this.fieldTiles[i].showHiddenCows();
		}
	},
	resetTreeOpacities: function()
	{
		for(var i=0; i<this.tiles.length; i++)
		{
			this.tiles[i].setTreeOpacity(1);
		}
	},
	
	addCow: function()
	{
		// Find Tile with least Cows an create Cow
		var chosenTile = false;
		for(var i=0; i<this.tiles.length; i++)
		{
			// do not allow cattle if degraded or forest
			if(!(this.tiles[i].condition.ID==0 || this.tiles[i].condition.ID==1))
			{
				if(!chosenTile || this.tiles[i].cows.length<chosenTile.cows.length )
				{
					chosenTile = this.tiles[i];
				}
			}
		}	
		
		if(!chosenTile) return false;
		chosenTile.addCow();
		return true;
	},
	getCows: function(tileCondition)
	{
		// Return Array of Cows on all Tiles
		var cows = new Array();
		for(var i=0; i<this.tiles.length; i++)
		{
			if(tileCondition)
			{
				if(tileCondition==this.tiles[i].condition.name) cows = cows.concat(this.tiles[i].cows);
			}
			else
				cows = cows.concat(this.tiles[i].cows);
		}
		return cows;
	},
	getOldestCow: function()
	{
		var cows = this.getCows();
		if(cows.length==0) return false;
		// Find oldest Cow to remove
		var oldestCow = null;
		var oldestCowI = null;
		for(var i=0; i<cows.length; i++)
		{
			if(!oldestCow || cows[i].age>oldestCow.age)
			{
				oldestCow = cows[i];
				oldestCowI = i;
			}
		}
		return oldestCow;
	},
	getAvgDegradation: function()
	{
		var degradation = 0;
		var pastures = 0;
		for(var i=0; i<this.fieldTiles.length; i++)
		{
			if(this.fieldTiles[i].condition.name=="pasture" || this.fieldTiles[i].condition.name=="degraded")
			{
				degradation+= this.fieldTiles[i].degradation;
				pastures++;
			}
		}
		console.log(degradation);
		console.log(pastures);
		var avg = pastures>0 ? degradation/pastures : 0;
		return avg;
	},
	
	contaminate: function() {
		for(var i=0; i<this.tiles.length; i++)
		{
			this.tiles[i].dirty = true;
			this.tiles[i].render = true;
		}	
	},
	
	prerenderMap: function() {
		var drawn = false;
		// Draw Layers
		for(var layer=0; layer<5; layer++)
		{
			// Draw Borders of Playable Area under Layer 0
			if(layer==1) GameEngine.map.drawMapBorder();
			// Draw Tiles, Deepest First
			for(var z=0; z<this.zBuffer.length; z++)
			{
				if(this.zBuffer[z])
				{
					for(var k=0; k<this.zBuffer[z].length; k++)
					{
						var tile = this.zBuffer[z][k];
						if( tile.isVisible(layer==0) && tile.render ) { tile.draw(layer,RenderEngine.prerenderContext); drawn = true; }
					}
				}
			}
		}
		return drawn;
	},
	clipCanvas: function()
	{
		RenderEngine.context.beginPath();
		for(var z=0; z<this.zBuffer.length; z++)
		{
			if(this.zBuffer[z])
			{
				for(var k=0; k<this.zBuffer[z].length; k++)
				{
					var tile = this.zBuffer[z][k];
					// add Tile Areas to canvas mask that are not dirty
					if( tile.isVisible(false) && tile.dirty)
					{
						var box = tile.boundingBox();
						RenderEngine.context.rect(box.x, box.y, box.w, box.h);
					}
					tile.dirty = false;
					tile.render = false;
				}
			}
		}
		RenderEngine.context.clip();
	},
	
	drawMapBorder: function(ground) {
		// Draw Border
		var e = this.fieldOrigin.e+this.fieldSize.e;
		var s = this.fieldOrigin.s+this.fieldSize.s;
		var corner1 = this.getCanvasCoords(this.fieldOrigin.e,this.fieldOrigin.s);
		var corner2 = this.getCanvasCoords(e,this.fieldOrigin.s);
		var corner3 = this.getCanvasCoords(e,s);
		var corner4 = this.getCanvasCoords(this.fieldOrigin.e,s);
		
		var context = RenderEngine.prerenderContext;
		
			context.beginPath();
				context.moveTo(corner1.x,corner1.y);
				context.lineTo(corner2.x,corner2.y);
			context.stroke();
			
			context.beginPath();
				context.moveTo(corner2.x,corner2.y);
				context.lineTo(corner3.x,corner3.y);
			context.stroke();
			
			context.beginPath();
				context.moveTo(corner3.x,corner3.y);
				context.lineTo(corner4.x,corner4.y);
			context.stroke();
			
			context.beginPath();
				context.moveTo(corner4.x,corner4.y);
				context.lineTo(corner1.x,corner1.y);
			context.stroke();
		
		if(ground) context.fill();
	},
	drawMapGround: function() {
		// Draw Border
		var corner = this.getCanvasCoords(0,0);
		
		var context = RenderEngine.prerenderContext;
		context.beginPath();
			context.moveTo(corner.x,corner.y);
			corner = this.getCanvasCoords(this.worldSize.e,0);
			context.lineTo(corner.x,corner.y);
			corner = this.getCanvasCoords(this.worldSize.e,this.worldSize.s);
			context.lineTo(corner.x,corner.y);
			corner = this.getCanvasCoords(0,this.worldSize.s);
			context.lineTo(corner.x,corner.y);
		context.closePath();
		context.fill();
	},
	
	getWorldCoords: function(x,y)
	{
		var virtualTileX = (x - this.mapOrigin.x) / this.tileWidth;
		var virtualTileY = (y - this.mapOrigin.y) / this.tileHeight;
		
		var isoTileE = virtualTileX - virtualTileY;
		var isoTileS = virtualTileY + virtualTileX;
		
		return { e: isoTileE, s: isoTileS };
	},
	
	getCanvasCoords: function(e,s,subpixel)
	{
		var x = this.tileWidth/2 * e + this.tileWidth/2 * s;
		var y = this.tileHeight/2 * s - this.tileHeight/2 * e;
		
		x = x + this.mapOrigin.x;
		y = y + this.mapOrigin.y;
		
		if(!subpixel)
		{
			x = Math.round(x);
			y = Math.round(y);
		}
		
		return { x: x, y: y };
	},
	
	getTile: function(e,s,fieldOnly)
	{
		if(fieldOnly===undefined) fieldOnly = true;
		if( e<this.worldSize.e && s<this.worldSize.s && e>0 && s>0 )
		{
			var i = Math.floor(e) + Math.floor(s)*this.worldSize.e ;
			var tile = this.tiles[i];
			
			if(tile && (tile.isPlayable() || !fieldOnly) ) return tile;
		}
		return false;
	},

	moveOrigin: function(x,y)
	{
		this.mapOrigin.x += x;
		this.mapOrigin.y += y;
		
		// Limit Map Movement
		var xMax = 0 - this.tileWidth/2 * (this.fieldOrigin.e+this.fieldOrigin.s) + 20;
		var xMin = xMax - this.width + window.innerWidth*RenderEngine.canvasScale - 20;
		var yMax = this.height/2 + 20;
		var yMin = window.innerHeight*RenderEngine.canvasScale - this.height/2 - 20;
			
		this.mapOrigin.x = Math.min(this.mapOrigin.x,xMax);
		this.mapOrigin.y = Math.min(this.mapOrigin.y,yMax);
		this.mapOrigin.x = Math.max(this.mapOrigin.x,xMin);
		this.mapOrigin.y = Math.max(this.mapOrigin.y,yMin);
		
		this.contaminate();
	}
});