InputEngineClass = Class.extend({

	keyState: [256],
	mousedown: false,
	
	selecting: false,
	selectAction: null,
	reverseAction: null,
	startInteraction: false,
	endInteraction: false,
	pathInteraction: false,
	pathHighlight: false,
	allowCancel: true,
	
	previousDragPos: false,
	previousTile: false,
    
	setup: function(event) {
		window.addEventListener('keydown', this.keydown, false);
		window.addEventListener('keyup', this.keyup, false);
		
		var clickOrTouch = (('ontouchend' in window)) ? 'touchend' : 'click';
		
		if(clickOrTouch=='touchend')
		{
			RenderEngine.canvas.addEventListener('touchstart', this.touchstart);
			RenderEngine.canvas.addEventListener('touchmove', this.touchmove);
			RenderEngine.canvas.addEventListener('touchend', this.touchend);
			RenderEngine.canvas.addEventListener('touchcancel', this.touchcancel);
		}
		else
		{
			RenderEngine.canvas.addEventListener('mousedown', function(e){ InputEngine.onMouseDown(e) }, false);
			window.addEventListener('mouseup', function(e){ InputEngine.mousedown = false; });
			RenderEngine.canvas.addEventListener('mouseup', function(e){ InputEngine.onMouseUp(e) });
			RenderEngine.canvas.addEventListener('mousemove', function(e){ InputEngine.onMouseMove(e) }, false);
		}
		
		this.mousedown = false;
		
		
		$('a[href="#fert"]').on(clickOrTouch, this.fertilize);
		$('a[href="#defo"]').on(clickOrTouch, this.deforest);
		$('a[href="#rest"]').on(clickOrTouch, this.restore);
		$('a[href="#intens"]').on(clickOrTouch, this.intensify);
		$('a[href="#buycow"]').on(clickOrTouch, function(e) { e.preventDefault(); InputEngine.onBuyCow(e); });
		$('a[href="#sellcow"]').on(clickOrTouch, function(e) { e.preventDefault(); InputEngine.onSellCow(e); });
		$('a[href="#movecow"]').on(clickOrTouch, function(e) { e.preventDefault(); InputEngine.onMoveCow(e); });
		$('a[href="#sellall"]').on(clickOrTouch, function(e) { e.preventDefault(); InputEngine.sellAll(e); });
		$('a[href="#fillintensified"]').on(clickOrTouch, function(e) { e.preventDefault(); InputEngine.fillIntensified(e); });
		$('a[href="#buylicence"]').on(clickOrTouch, function (e) { e.preventDefault(); GameEngine.buyLicence(); return false; });
		$('a[href="#cancel"]').on(clickOrTouch, this.cancel);
		$('a[href="#accept"]').on(clickOrTouch, this.accept);
		$('a[href="#stats"]').on(clickOrTouch, this.stats);
		$('a[href="#closestats"]').on(clickOrTouch, this.closestats);
		$('a[href="#amortizeloan"]').on(clickOrTouch, this.amortizeloan);
		$('a[href="#takeloan"]').on(clickOrTouch, this.takeloan);
		$('a[href="#nextround"]').on(clickOrTouch, function(e) { e.preventDefault(); InputEngine.nextround(e); });
		$('a[href="#startreal"]').on(clickOrTouch, function (e) { e.preventDefault(); RenderEngine.showDialog("startRealWarning") });
		$('a[href="#restart"]').on(clickOrTouch, function (e) { e.preventDefault(); RenderEngine.showDialog("restartWarning") });
		
		$('a[href="#startrealconfirm"]').on(clickOrTouch, function (e) { e.preventDefault(); GameEngine.endGame(); });
		$('a[href="#restartconfirm"]').on(clickOrTouch, function (e) { e.preventDefault(); window.location.reload(); });
		
		$('form#playerExpectation').on('submit', function(e) { e.preventDefault(); GameEngine.saveExpectation(); });
		$('a[href="#closeWindow"]').on(clickOrTouch, function(e) { e.preventDefault(); RenderEngine.closeWindow($(e.target).parents(".window")); });

    },
	
	touchstart: function (event) {
		console.log("TouchStart");
		InputEngine.onTouchStart(event);
	},
	touchmove: function (event) {
		console.log("TouchMove");
		InputEngine.onTouchMove(event);
	},
	touchend: function (event) {
		console.log("TouchEnd");
		InputEngine.onTouchEnd(event);
	},
	touchcancel: function (event) {
		console.log("TouchCancel");
		InputEngine.onTouchEnd(event);
	},
	keydown: function (event) {
		InputEngine.onKeyDown(event);
	},
	keyup: function (event) {
		InputEngine.onKeyUp(event);
	},
	fertilize: function (event) {
		event.preventDefault();
		InputEngine.onFertilize(event);
		return false;
	},
	deforest: function (event) {
		event.preventDefault();
		InputEngine.onDeforest(event);
		return false;
	},
	restore: function (event) {
		event.preventDefault();
		InputEngine.onRestore(event);
		return false;
	},
	intensify: function (event) {
		event.preventDefault();
		InputEngine.onIntensify(event);
		return false;
	},
	fillIntensified: function(event) {
		event.preventDefault();
		GameEngine.fillIntensified();
		return false;
	},
	sellAll: function(event)
	{
		if(this.selecting)
		{
			GameEngine.sellAllOldCows();
		}
	},
	stats: function (event) {
		event.preventDefault();
		InputEngine.onStats(event);
		return false;
	},
	cancel: function (event) {
		event.preventDefault();
		if(	GameEngine.confirmAction(false,InputEngine.selectAction) )
			InputEngine.stopSelection();
		return false;
	},
	accept: function (event) {
		event.preventDefault();
		if(	GameEngine.confirmAction(true,InputEngine.selectAction)	)
			InputEngine.stopSelection();
		return false;
	},
	nextround: function (event) {
		if(!this.selecting && !$(".nextround").is(".inactive"))
		{
			RenderEngine.goFullscreen(event);
			GameEngine.animateIntoNextRound();
		}
		return false;
	},
	closestats: function (event) {
		event.preventDefault();
		InputEngine.onCloseStats(event);
		return false;
	},
	amortizeloan: function (event) {
		event.preventDefault();
		GameEngine.amortizeLoan();
		return false;
	},
	takeloan: function (event) {
		event.preventDefault();
		GameEngine.takeLoan();
		return false;
	},

	// Button Inputs 1 (starting Selection)
	onFertilize: function(event)
	{
		console.log("onFertilizeEvent");
		if(!this.selecting)
		{
			$(".actions a").addClass("inactive");
			$(event.target).removeClass("inactive").addClass("active");
			this.startSelection("fertilize");
		}
	},
	onDeforest: function(event)
	{
		console.log("onDeforestEvent");
		if(!this.selecting)
		{
			$(".actions a").addClass("inactive");
			$(event.target).removeClass("inactive").addClass("active");
			this.startSelection("deforest");
		}
	},
	onRestore: function(event)
	{
		console.log("onRestoreEvent");
		if(!this.selecting)
		{
			$(".actions a").addClass("inactive");
			$(event.target).removeClass("inactive").addClass("active");
			this.startSelection("restore");
			RenderEngine.requestDelayed("drawDegradationNumber");
		}
	},
	onIntensify: function(event)
	{
		console.log("onIntensifyEvent");
		if(!this.selecting)
		{
			$(".actions a").addClass("inactive");
			$(event.target).removeClass("inactive").addClass("active");
			this.startSelection("intensify");
			RenderEngine.requestDelayed("drawDegradationNumber");
		}
	},
	onBuyCow: function(event)
	{
		console.log("onBuyCowEvent");
		if(!this.selecting)
		{
			$(".actions a").addClass("inactive");
			$(event.target).removeClass("inactive").addClass("active");
			this.startSelection("buyCow");
			GameEngine.map.showHiddenCows();
			RenderEngine.requestDelayed("drawDegradationNumber");
		}
	},
	onSellCow: function(event)
	{
		console.log("onSellCowEvent");
		if(!this.selecting)
		{
			$(".actions a").addClass("inactive");
			$(event.target).removeClass("inactive").addClass("active");
			this.startSelection("sellCow");
			RenderEngine.requestDelayed("drawCowPrices");
			GameEngine.map.showHiddenCows();
		}
	},
	onMoveCow: function(event)
	{
		console.log("onMoveCowEvent");
		if(!this.selecting)
		{
			$(".actions a").addClass("inactive");
			$(event.target).removeClass("inactive").addClass("active");
			this.startSelection("moveCow");
			GameEngine.map.highlightCows();
			RenderEngine.requestDelayed("drawDegradationNumber");
		}
	},
	startSelection: function(action)
	{
		this.selecting = true;
		this.selectAction = action;
		this.allowCancel = true;
		this.startInteraction = true;
		this.endInteraction = true;
		this.pathInteraction = true;
		this.pathHighlight = false;
		this.previousTile = false;
		if(action=="moveCow") 
		{
			this.pathInteraction = false;
			this.pathHighlight = true;
			this.allowCancel = false;
		}
		this.mousedown = false;
		
		RenderEngine.drawConfirm();
	},
	stopSelection: function()
	{
		this.selecting = false;
		RenderEngine.drawConfirm();
		RenderEngine.drawActionButtons();
	},
	
	// Button Inputs 2
	onStats: function(event)
	{
		console.log("onStatsEvent");
		$(".quickstats div").removeClass("highlight");
		$(".statsbg").show();
		$(".fullstats").show(); /*.css("opacity",0);
		setTimeout(function() { $(".fullstats").css("opacity",1); },10);*/
	},
	onCloseStats: function(event)
	{
		console.log("onCloseStatsEvent");
		$(".fullstats").hide();
		$(".statsbg").hide();
		
		/*$(".fullstats").css("opacity",0);
		setTimeout(function() { $(".fullstats").hide(); },500);*/
	},
	// Mouse Inputs
	onMouseDown: function(event)
	{
		var x = event.offsetX==undefined ? event.layerX:event.offsetX;
		var y = event.offsetX==undefined ? event.layerY:event.offsetY;
		//console.log("onMouseDownEvent "+x+" : "+y);
		
		this.previousDragPos = {x: x, y: y};
		this.mousedown = true;
		this.reverseAction = null;
		
		if(this.startInteraction) this.tileInteraction(x,y);
	},
	onMouseUp: function(event)
	{
		var x = event.offsetX==undefined ? event.layerX:event.offsetX;
		var y = event.offsetX==undefined ? event.layerY:event.offsetY;
		//console.log("onMouseUpEvent "+x+" : "+y);
		
		this.mousedown = false;
		
		if(this.endInteraction) this.tileInteraction(x,y);
		this.previousTile = false;
	},
	onMouseMove: function (event)
	{
		var x = event.offsetX==undefined ? event.layerX:event.offsetX;
		var y = event.offsetX==undefined ? event.layerY:event.offsetY;
		
		if(this.mousedown) this.onDrag(x,y);
	},
	// Touch Inputs
	onTouchStart: function (event)
	{
		var touch = event.touches[0];
		this.previousDragPos = {x: touch.pageX, y: touch.pageY};
		this.reverseAction = null;
		
		if(this.selecting || !GameEngine.nativeScrolling) event.preventDefault();
		
		if(this.selecting)
		{
			if(this.startInteraction) this.tileInteraction(touch.pageX,touch.pageY);
		}
	},
	onTouchMove: function (event)
	{
		if(this.selecting || !GameEngine.nativeScrolling) event.preventDefault();
		
		var touch = event.touches[0];
		InputEngine.onDrag(touch.pageX,touch.pageY);
	},
	onTouchEnd: function (event)
	{
		if(this.selecting || !GameEngine.nativeScrolling) event.preventDefault();
		
		if(this.selecting)
		{
			if(this.endInteraction) this.tileInteraction(this.previousDragPos.x,this.previousDragPos.y);
			this.previousTile = false;
		}
	},
	// Common 2D Input Logic
	onDrag: function (x,y)
	{
		var delta = {x: x-this.previousDragPos.x , y: y-this.previousDragPos.y};
		RenderEngine.updateCursorImage(x,y);
		
		if(this.selecting)
		{
			if(this.pathInteraction) this.tileInteraction(x,y);
			if(this.pathHighlight) InputEngine.tileHighlight(x,y);
		}
		else if(!GameEngine.nativeScrolling)
		{
			// Alternative to native scrolling (to avoid large canvas)
			GameEngine.map.moveOrigin(delta.x*RenderEngine.canvasScale,delta.y*RenderEngine.canvasScale);
			//RenderEngine.context.translate(delta.x*RenderEngine.canvasScale,delta.y*RenderEngine.canvasScale);
			RenderEngine.requestDraw();
		}
		this.previousDragPos = {x: x, y: y};
	},
	tileHighlight: function (x,y)
	{
		var coords = RenderEngine.canvasCoords(x,y);
		
		var wCoords = GameEngine.map.getWorldCoords(coords.x, coords.y);
		var tile = GameEngine.map.getTile(wCoords.e, wCoords.s);
		
		if(tile) 
		{
			GameEngine.map.removeHighlights();
			tile.highlight(this.selectAction);
		}
	},
	tileInteraction: function (x,y)
	{
		// Interact only when in Selecting Mode
		if(this.selecting)
		{
			var coords = RenderEngine.canvasCoords(x,y);
			
			var wCoords = GameEngine.map.getWorldCoords(coords.x, coords.y);
			var tile = GameEngine.map.getTile(wCoords.e, wCoords.s);
			
			// Do not Interact if Interacted with this Tile already. Exception: Exclusive Start/End Interaction (Non-Path)
			if(tile && (tile!==this.previousTile || !this.pathInteraction))
			{
				if(this.selectAction=="moveCow")
				{
					GameEngine.moveCow(tile);
				}
				else
				{
					var actionAmount = GameEngine.tileAction(tile,this.selectAction,this.reverseAction);
					// check if reverseAction is not yet set and set it to true when current Action was a reverseAction
					if(this.reverseAction == null)
					{
						if(actionAmount==-1) this.reverseAction = true;
						else if(actionAmount==1) this.reverseAction = false;
					}
				}
				
				this.previousTile = tile;
			}
		}
	},
	// Key Inputs (not used in Cattle Farming Game)
	onKeyDown: function (event)
	{
		var keyID = event.which;
		//console.log("onKeyDownEvent "+keyID);
		this.keyState[keyID] = true;
	},
	onKeyUp: function (event) {
		var keyID = event.which;
		//console.log("onKeyUpEvent "+keyID);
		this.keyState[keyID] = false;
	}


});

InputEngine = new InputEngineClass();
