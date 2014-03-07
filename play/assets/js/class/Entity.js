EntityClass = Class.extend({
	
	forms: {
		250: {
			"empty-tile":  {image: "250_empty.png", origin: {x: 125, y: 148} },
			"grass-tile": {image: "250_grass.png", origin: {x: 125, y: 148} },
			"tile-selection": {image: "250_selection.png", origin: {x: 125, y: 148} },
			"tile-selection-red": {image: "250_selection-red.png", origin: {x: 125, y: 148} },
			"grid": {image: "250_grid.png", origin: {x: 125, y: 148} },
			
			"grass-over-n": {image: "250_grass-over-n.png", origin: {x: 125, y: 148} },
			"grass-over-e": {image: "250_grass-over-e.png", origin: {x: 125, y: 148} },
			"grass-over-s": {image: "250_grass-over-s.png", origin: {x: 125, y: 148} },
			"grass-over-w": {image: "250_grass-over-w.png", origin: {x: 125, y: 148} },
			
			"forest-grass": {image:"250_forest-grass.png", origin: {x: 125, y: 148} },
			
			"grass-fertilized": {image: "250_fertilized.png", origin: {x: 125, y: 148} },
			
			"intensi-1": {image:"250_intensi.png", origin: {x: 125, y: 148} },
			
			"forest-1": {image:"250_forest-1.png", origin: {x: 55, y: 55}},
			"forest-2": {image:"250_forest-2.png", origin: {x: 62, y: 54}},
			"forest-3": {image:"250_forest-3.png", origin: {x: 57, y: 37}},
			
			"tree-1": {image:"250_tree-1.png", origin: {x: 72, y: 117}},
			"tree-2": {image:"250_tree-2.png", origin: {x: 65, y: 138}},
			"tree-3": {image:"250_tree-3.png", origin: {x: 64, y: 130}},
			"tree-4": {image:"250_tree-4.png", origin: {x: 68, y: 130}},
			"tree-5": {image:"250_tree-5.png", origin: {x: 91, y: 203}},
			"tree-6": {image:"250_tree-6.png", origin: {x: 85, y: 190}},
			
			"grass-patch-1": {image:"250_grass-patch-1.png", origin: {x: 37, y: 26} },
			"grass-patch-2":{image:"250_grass-patch-2.png", origin: {x: 45, y: 26} },
			"grass-patch-3":{image:"250_grass-patch-3.png", origin: {x: 50, y: 30} },
			
			"grass-object-1": {image:"250_grass-object-1.png", origin: {x: 10, y: 10} },
			"grass-object-2": {image:"250_grass-object-2.png", origin: {x: 10, y: 10} },
			"grass-object-3": {image:"250_grass-object-3.png", origin: {x: 7, y: 7} },
			"grass-object-4": {image:"250_grass-object-4.png", origin: {x: 20, y: 15} },
			"grass-object-5": {image:"250_grass-object-5.png", origin: {x: 15, y: 9} },
			
			"cow-highlight": {image:"250_cow-highlight.png", origin: {x: 25, y: 34} },
			"cow-highlight-red": {image:"250_cow-highlight-red.png", origin: {x: 25, y: 34} }
		},
		150: {
			"empty-tile":  {image: "150_empty.png", origin: {x: 75, y: 88} },
			"grass-tile": {image: "150_grass.png", origin: {x: 75, y: 88} },
			"tile-selection": {image: "150_selection.png", origin: {x: 75, y: 89} },
			"tile-selection-red": {image: "150_selection-red.png", origin: {x: 75, y: 89} },
			"grid": {image: "150_grid.png", origin: {x: 75, y: 89} },
			
			"grass-over-n": {image: "150_grass-over-n.png", origin: {x: 75, y: 89} },
			"grass-over-e": {image: "150_grass-over-e.png", origin: {x: 75, y: 89} },
			"grass-over-s": {image: "150_grass-over-s.png", origin: {x: 75, y: 89} },
			"grass-over-w": {image: "150_grass-over-w.png", origin: {x: 75, y: 89} },
			
			"forest-grass": {image:"150_forest-grass.png", origin: {x: 75, y: 89} },
			
			"grass-fertilized": {image: "150_fertilized.png", origin: {x: 75, y: 89} },
			
			"intensi-1": {image:"150_intensi.png", origin: {x: 75, y: 89} },
			
			"forest-1": {image:"150_forest-1.png", origin: {x: 33, y: 33}},
			"forest-2": {image:"150_forest-2.png", origin: {x: 37, y: 33}},
			"forest-3": {image:"150_forest-3.png", origin: {x: 34, y: 22}},
			
			"tree-1": {image:"150_tree-1.png", origin: {x: 43, y: 70}},
			"tree-2": {image:"150_tree-2.png", origin: {x: 39, y: 83}},
			"tree-3": {image:"150_tree-3.png", origin: {x: 39, y: 78}},
			"tree-4": {image:"150_tree-4.png", origin: {x: 41, y: 78}},
			"tree-5": {image:"150_tree-5.png", origin: {x: 55, y: 122}},
			"tree-6": {image:"150_tree-6.png", origin: {x: 51, y: 114}},
			
			"grass-patch-1": {image:"150_grass-patch-1.png", origin: {x: 22, y: 16} },
			"grass-patch-2":{image:"150_grass-patch-2.png", origin: {x: 27, y: 16} },
			"grass-patch-3":{image:"150_grass-patch-3.png", origin: {x: 30, y: 18} },
			
			"grass-object-1": {image:"150_grass-object-1.png", origin: {x: 6, y: 6} },
			"grass-object-2": {image:"150_grass-object-2.png", origin: {x: 6, y: 6} },
			"grass-object-3": {image:"150_grass-object-3.png", origin: {x: 4, y: 4} },
			"grass-object-4": {image:"150_grass-object-4.png", origin: {x: 12, y: 9} },
			"grass-object-5": {image:"150_grass-object-5.png", origin: {x: 9, y: 5} },
			
			"cow-highlight": {image:"150_cow-highlight.png", origin: {x: 15, y: 20} },
			"cow-highlight-red": {image:"150_cow-highlight-red.png", origin: {x: 15, y: 20} }
		}
	},
	
	name: "",
	group: false,
	image: null,
	origin: {x: 0, y: 0},
	pos: {e: 0, s: 0},
	layer: 1,
	subpixel: false,
	opacity: 1,
	
	init: function (formname,pos,group) {
		this.group = group!=undefined ? group : false;
		
		if(!formname)
		{
			console.log("Invisible Entity created");
			return;
		}
		
		var size = GameEngine.map.tileWidth;
		var form = this.forms[size][formname];
		if(!form) { console.log(formname+" not found (init)"); return false; }
		
		this.name = formname;
		this.image = AssetLoader.get(form.image);
		this.origin = form.origin;
		this.pos = pos;
		
		if(form.renderSize)
		{
			this.subpixel = true;
			this.renderSize = form.renderSize;
		}
	},
	
	change : function(formname)
	{
		var size = GameEngine.map.tileWidth;
		var form = this.forms[size][formname];
		if(!form) { console.log(formname+" not found (change)"); return false; }
		
		this.name = formname;
		this.image = AssetLoader.get(form.image);
		this.origin = form.origin;
		
		if(form.renderSize)
		{
			this.subpixel = true;
			this.renderSize = form.renderSize;
		}
	},
	
	update : function() { }
});