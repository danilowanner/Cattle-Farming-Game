

GameEngineClass = Class.extend({
	
	i: null,
	map: null,
	
	nativeScrolling: true,
	fps: 6,
	updateInt: null,
	ticks: 0,
	paused: false,
	
	game: null,
	player: null,
	round: null,
	treatment: null,
	globals: null,
	
	lastRound: null,
	
	stats: null,
	lastStats: null,
	graphs: null,
	
	actionRevenue: 0,
	actionAmount: 0,
	actionLicence: false,
	actionCostUnsecured: false,
	actionBlocked: false,

	//-----------------------------
	setup: function ()
	{
		Network.refreshGlobals();
		Network.loadGame(GameEngine.loadGameSuccess);
	},
	
	
	loadGameSuccess: function (data)
	{
		GameEngine.startNewGame(data);
	},
	startNewGame: function (data)
	{
		this.game = data.game;
		this.player = data.player;
		this.round = data.round;
		this.treatment = data.treatment;
		
		// Show Experimenter Hint
		$(".experimenterHint").html(this.treatment.id+" | "+this.player.treatment+" | "+this.player.id);
		
		// Show Menu according to Treatment
		$(".startreal").hide()
		//if(this.treatment.id!=8) $(".restart").hide();
		
		// Reset Variables
		lastRound = null;
		this.stats = null;
		this.lastStats = null;
		
		// Setup Graphs
		this.graphs = new Object();
		this.graphs.cowValue = new Array();
		this.graphs.carbonPrice = new Array();
		this.graphs.soldTotal = new Array();
		this.graphs.actualTotal = new Array();
		
		// Start first Round
		this.lastRound = copy(this.round);
		this.round.round += 1;
		this.round.cowPriceExpectation = "NULL";
		this.round.carbonPriceExpectation = "NULL";
		
		this.map = new MapClass();
		this.map.setup();
		this.map.generate( this.treatment.startPastureTileNum );
		
		// Update Graphs with first Years values
		this.graphs.cowValue.push( this.treatment.cowValue(2) );
		this.graphs.carbonPrice.push( this.treatment.carbonPrice() );
		
		RenderEngine.draw();
		RenderEngine.drawQuickstats();
		RenderEngine.drawStats();
		RenderEngine.drawActionButtons();
		
		RenderEngine.fadeInControls();
		this.tick();
	},
	endGame: function ()
	{
		Network.finishGame(function()
		{
			window.location.reload();
		});
	},
	
	animateIntoNextRound: function ()
	{
		// If this was endYear, quit Game instead of next round
		if(GameEngine.treatment.startYear+GameEngine.round.round-1 == GameEngine.treatment.endYear)
		{
			this.endGame();
		}
		else
		{
			$(".nextYearScreen").addClass("animate").show();
			$(".nextYearScreen div").html($.t("game.year")+" "+(GameEngine.treatment.startYear + GameEngine.round.round));
			
			$(".nextround").addClass("inactive");
			
			setTimeout(function() { $(".nextYearScreen").hide().removeClass("animate");
				$(".quickstats div").removeClass("highlight");
				$(".fullstats").show(); $(".statsbg").show();
				$(".nextround").removeClass("inactive");
			},3000); //3000
			setTimeout(function() { GameEngine.nextRound() },1000); //1000
		}
	},
	
	nextRound: function ()
	{
		this.lastStats = new Object();
		this.lastStats = copy(this.stats);
		this.stats = new Object();
		
		// Save Loans and Savings at End of Year
		this.stats.savings = this.round.savings;
		this.stats.loans = this.round.loans;
		
		// Calculate Stats and Changes to next Round
		this.stats.repairCost = this.treatment.repairCost();
		this.round.savings -= this.stats.repairCost;
		this.stats.personalCost = this.treatment.personalCost;
		this.round.savings -= this.stats.personalCost;
		
		this.round.actual = this.treatment.actual();
		this.round.tco2 = this.treatment.tco2();
		if(this.round.tco2>this.round.tco2Sold)
			this.round.tco2Sold = this.round.tco2;
		
		this.stats.tco2SoldToday = (this.lastRound) ? this.round.tco2Sold - this.lastRound.tco2Sold : this.round.tco2Sold;
		this.stats.carbonPrice = this.treatment.carbonPrice();
		this.stats.forest = this.treatment.forest();
		this.stats.forestPrice = this.treatment.forestPrice();
		this.round.subsidies = this.treatment.subsidies();
		this.stats.subsidies = this.round.subsidies;
		this.round.savings += this.round.subsidies;
		
			//Update Carbon Graphs
			this.graphs.soldTotal.push( this.round.tco2Sold );
			this.graphs.actualTotal.push( this.round.actual );
		
		this.stats.loanTransaction = this.round.savings<=this.round.loans ? 0-this.round.savings : 0-this.round.loans;
		this.round.savings += this.stats.loanTransaction;
		this.round.loans += this.stats.loanTransaction;
		
		this.stats.loanInterest = this.treatment.loanInterest();
		this.stats.savingsInterest = this.treatment.savingsInterest();
		this.round.loans += this.stats.loanInterest;
		this.round.savings += this.stats.savingsInterest;
		
			// Show warning if loan Limit reached
			if(this.round.loans>this.treatment.loanLimit)
				RenderEngine.showDialog("loanWarning");
				
			// If Carbon Payments Finished Show Warning and Hide Carbon Subsidies the next Year
			if(this.treatment.showCarbonSubsidies && this.round.round==25)
				RenderEngine.showDialog("subsidiesFinished");
			else if(this.treatment.showCarbonSubsidies && this.round.round==26)
				this.treatment.showCarbonSubsidies = 0;
		
		// Calculate Game Entity Changes
		this.map.ageTiles(1);
		var cows = this.map.getCows();
		for(var i=0; i<cows.length; i++)
		{
			cows[i].age += 1;
			cows[i].update();
		}
		this.map.updateTiles();
		
		this.round.avgDegradation = this.map.getAvgDegradation();
		this.round.landValue = this.treatment.landValue();
		
		this.lastRound = copy(this.round);
		Network.saveRound(this.round);
		
		// ––––– ROUND CHANGE –––––
		// Start next Round
		this.round.deforestLicence = false;
		this.round.cowPriceExpectation = "NULL";
		this.round.carbonPriceExpectation = "NULL";
		this.round.round += 1;
		
		this.stats.newSavings = this.round.savings;
		this.stats.newLoans = this.round.loans;
		
		// Update Graphs with this Years Values
		this.graphs.cowValue.push( this.treatment.cowValue(2) );
		this.graphs.carbonPrice.push( this.treatment.carbonPrice() );
		console.log(this.graphs);
		
		// Draw New Stats and Graphs
		RenderEngine.drawStats();
		
		// Show Info Dialog if Player is now Starting endYear
		if(GameEngine.treatment.startYear+GameEngine.round.round-1 == GameEngine.treatment.endYear)
		{
			RenderEngine.showDialog("endYear");
			$(".nextround").html($.t("game.finish"));
		}
		// Show Treatment Dialogs
		this.treatment.showDialogs();
		
		RenderEngine.drawQuickstats();
		RenderEngine.drawActionButtons();
		RenderEngine.draw();
	},
	
	tileAction: function(tile,action,reverseAction)
	{
		console.log("Tile Action "+action);
		var actionResult = tile.change(action,reverseAction);
		if( actionResult )
		{
			// preview new tile condition and action costs
			this.actionRevenue -= actionResult.cost;
			this.actionAmount += actionResult.amount;
			
			this.updateActionBlock(action);
			RenderEngine.requestDraw();
			
			return actionResult.amount;
		}
		return false;
	},
	updateActionBlock: function(action)
	{
		// Block action if not enough money in savings
		if((0-this.actionRevenue)>this.round.savings)
		{
			this.actionCostUnsecured = true;
			this.actionBlocked = true;
		}
		// Block action if Intensify and less than minIntensifyTiles selected
		else if(action=="intensify" && this.actionAmount+this.round.intensified < this.treatment.minIntensifyTiles)
		{
			this.actionCostUnsecured = false;
			this.actionBlocked = true;
		}
		// Block action if more than one tile deforested in this round and no licence bought and licence purchase required
		else if(action=="deforest" && (this.round.deforested-this.lastRound.deforested+this.actionAmount) >1 && !this.round.deforestLicence && GameEngine.treatment.deforestLicenceCost>0 )
		{
			this.actionCostUnsecured = false;
			this.actionBlocked = true;
			$(".confirm .licence").addClass("highlight");
		}
		else
		{
			this.actionCostUnsecured = false;
			this.actionBlocked = false;
		}
		RenderEngine.drawConfirm();
	},
	
	confirmAction: function(accept,action)
	{
		if(accept)
		{
			// Do not accept when actionBlocked
			if(this.actionBlocked) return false;
			
			// Update round
			switch(action)
			{
				case "buyCow": this.round.cowsBought += this.actionAmount;
				break;
				case "sellCow": this.round.cowsSold += this.actionAmount;
				break;
				case "deforest": this.round.deforested += this.actionAmount;
				break;
				case "intensify": this.round.intensified += this.actionAmount;
				break;
				case "restore": this.round.restored += this.actionAmount;
				break;
			}
			this.round.savings += this.actionRevenue;
			
			if( Math.abs(this.actionRevenue)>0 ) SoundEngine.playSoundInstance("coins.m4a");
			
			GameEngine.map.acceptTiles();
			GameEngine.map.updateTiles();
			
			RenderEngine.drawQuickstats();
		}
		else
		{
			if(this.actionLicence) this.round.deforestLicence = false;
			
			GameEngine.map.restoreTiles();
		}
		
		SoundEngine.stopSoundInstance("tractor.m4a",true);
		
		this.actionRevenue = 0;
		this.actionAmount = 0;
		this.actionCostUnsecured = false;
		this.actionBlocked = false;
		this.actionLicence = false;
		
		this.map.removeCowHiglights();
		this.map.removeHighlights();
		this.map.resetTreeOpacities();
		
		this.paused = true;
		RenderEngine.drawConfirm();
		
		RenderEngine.requestDelayed("hideCursorImage");
		RenderEngine.requestDelayed("removeOverlays");
		RenderEngine.requestDelayed("draw");
		
		setTimeout(function(){ GameEngine.paused = false; },50);
		
		return true;
	},
	
	sellAllOldCows: function()
	{
		// Sell All Cows 2 years or older
		var cows = this.map.getCows();
		var cowsSold = false;
		for(var i=0; i<cows.length; i++)
		{
			if(cows[i].age>=2)
			{
				// Revert eventual Previous Actions on this Tile
				this.tileAction(cows[i].tile,"",true);
				// Do Action sellAllOldCows
				this.tileAction(cows[i].tile,"sellAllOldCows",false);
				cowsSold = true;
			}
		}
		// Play multiple cow sounds with slight delays if cows sold
		if(cowsSold)
		{
			SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a");
			setTimeout(function() { SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a") },100);
			setTimeout(function() { SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a") },150);
		}
	},
	fillIntensified: function()
	{
		// Buy three Cows in all Intensified
		var cowsBought = false;
		for(var i=0; i<this.map.fieldTiles.length; i++)
		{
			var tile = this.map.fieldTiles[i];
			if(tile.condition.name=="intensi")
			{
				// Revert eventual Previous Actions on this Tile
				this.tileAction(tile,"",true);
				// Do Action buyCows
				this.tileAction(tile,"fillWithCows",false);
				cowsBought = true;
			}
		}
		// Play multiple cow sounds with slight delays if cows bought
		if(cowsBought)
		{
			SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a");
			setTimeout(function() { SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a") },100);
			setTimeout(function() { SoundEngine.playSoundInstance("cow_"+Math.ceil(Math.random()*5)+".m4a") },150);
		}
	},
	
	moveCow: function(tile)
	{
		if(this.movingCow)
		{
			// only add cow to new tile, if maxCows of this tile is not reached
			if(tile.condition.maxCows-tile.cows.length>0)
			{
				// put on new tile
				var movedCow = tile.addCow();
			}
			else
			{
				// put back to original tile
				var movedCow = this.movingCow.tile.addCow();
				
			}
			movedCow.age = this.movingCow.age;
			movedCow.update();
			
			this.movingCow = false;
			RenderEngine.hideCursorImage();
		}
		else
		{
			// See if Tile has Cows
			if(tile.cows.length>0)
			{
				this.movingCow = tile.cows[0];
				tile.removeCow(this.movingCow);
				
				RenderEngine.showCursorImage( AssetLoader.get("250_calf-b.png") );
				if(this.movingCow.age>0) RenderEngine.showCursorImage( AssetLoader.get("250_cow-b.png") );
				
			}
		}
		
		requestAnimationFrame(function()
		{
			// Update Cow Highlights
			GameEngine.map.removeCowHiglights();
			GameEngine.map.highlightCows();
			
			RenderEngine.draw();
		});
	},
	
	buyLicence: function()
	{
		if( !this.round.deforestLicence )
		{
			this.actionLicence = true;
			this.actionRevenue -= this.treatment.deforestLicenceCost;
			this.round.deforestLicence = true;
			
			if((0-this.actionRevenue)<=this.round.savings) { this.actionBlocked = false;  this.actionCostUnsecured = false; }
			else { this.actionBlocked = true; this.actionCostUnsecured = true; }
			
			$(".confirm .licence").removeClass("highlight");
			
			RenderEngine.drawConfirm();
		}
	},
	
	amortizeLoan: function()
	{
		var amount = this.treatment.loanIncrement;
		if(amount>this.round.savings) amount =this.round.savings;
		if(amount>this.round.loans) amount =this.round.loans;
		
		this.round.savings-=amount;
		this.round.loans-=amount;
		SoundEngine.playSoundInstance("coins.m4a");
		
		if(this.stats)
		{
			this.stats.newSavings-=amount;
			this.stats.newLoans-=amount;
			this.stats.loanTransaction -= amount;
		}
		
		if(InputEngine.selecting) this.updateActionBlock(InputEngine.selectAction);
		
		RenderEngine.drawStats();
		RenderEngine.drawQuickstats();
	},
	takeLoan: function()
	{
		var amount = this.treatment.loanIncrement;
		if(this.round.loans+this.treatment.loanIncrement > this.treatment.loanLimit)  amount = this.treatment.loanLimit-this.round.loans;
		
		this.round.savings+=amount;
		this.round.loans+=amount;
		SoundEngine.playSoundInstance("coins.m4a");
		
		if(this.stats)
		{
			this.stats.newSavings+=amount;
			this.stats.newLoans+=amount;
			this.stats.loanTransaction += amount;
		}
		
		if(InputEngine.selecting) this.updateActionBlock(InputEngine.selectAction);
		
		RenderEngine.drawStats();
		RenderEngine.drawQuickstats();
	},
	
	saveExpectation: function()
	{
		this.round.cowPriceExpectation = $('.window.playerExpectation select[name="cowPriceExpectation"]').val();
		this.round.carbonPriceExpectation = $('.window.playerExpectation select[name="carbonPriceExpectation"]').val();
		
		if(!GameEngine.treatment.showCarbonSubsidies) this.round.carbonPriceExpectation = "NULL";
		
		$('.window.playerExpectation select[name="carbonPriceExpectation"]').blur(); // hide Keyboard
		RenderEngine.closeWindow( $('.window.playerExpectation') );
	},
	loadGlobalsSuccess: function(globals)
	{	
		if(GameEngine.globals==null) GameEngine.globals = new Object();
		for(var index in globals) {
			var global = globals[index];
			this.globals[ global.key ] = global.value;
		}
		
		// enableRealButton
		if(this.treatment && this.treatment.id==8 && this.globals.enableRealButton) $(".startreal").show();
		else $(".startreal").hide();
		
		// enableMusic
		if(this.globals.enableMusic) SoundEngine.playSoundInstance("Scabeater_Searching.mp3",true);
		else SoundEngine.stopSoundInstance("Scabeater_Searching.mp3");
	},
	
	tick: function ()
	{
		GameEngine.map.tick();
		
		if(!this.paused)
		{
			RenderEngine.requestDraw();
		}
		this.ticks++;
		
		setTimeout(function() { GameEngine.tick(); }, 1000/this.fps);
		
	}

});

GameEngine = new GameEngineClass();
