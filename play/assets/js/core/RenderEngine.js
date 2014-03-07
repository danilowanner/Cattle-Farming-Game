RenderEngineClass = Class.extend({
	canvas: null,
	context: null,
	prerenderCanvas: null,
	prerenderContext: null,
	canvasScale: 1,
	
	cursorImage: null,
	renderTimes: Array(),
	renderTimeAvg: 0,
	fullRenderAgo: 0,
	
	setup: function ()
	{
		this.canvas = document.getElementById('gameCanvas');
		this.context = this.canvas.getContext('2d');
		this.prerenderCanvas = document.createElement('canvas');
		this.prerenderContext = this.prerenderCanvas.getContext('2d');
		//this.context.webkitImageSmoothingEnabled = false;
		
		// Google Nexus 7: 1.3312500715255737
		// Apple iPad: 2.0
		if(window.devicePixelRatio) this.canvasScale = window.devicePixelRatio;
		
		this.resize(window.innerWidth,window.innerHeight);
		this.clear();
	},
	resize: function(width,height)
	{
		var i = 0;
		width = Math.round(width);
		height = Math.round(height);
		
		console.log("resize a: "+width+" "+height);
		
		// Make canvas Pixels fit real Pixels perfectly for Devices with weird PixelRatios
		while(width*this.canvasScale%1 > 0.0001 && width*this.canvasScale%1 < 0.9999)
		{
			width += 1;
			i++;
		}
		while(height*this.canvasScale%1 > 0.0001 && height*this.canvasScale%1 < 0.9999)
		{
			height += 1;
			i++;
		}
		
		// Fix iOS canvas oversize bug (iOS adds two pixels for antialising)
		if(width==1024) width -= 1;
		
		console.log("resize b: "+this.canvas.width+" "+this.canvas.height);
		
		this.canvas.width = Math.floor(width* this.canvasScale);
		this.canvas.height = Math.floor(height* this.canvasScale);
		this.prerenderCanvas.width = this.canvas.width;
		this.prerenderCanvas.height = this.canvas.height;
		
		$(".gameCanvasContainer canvas").width( width ).height( height );
	},
	fadeInControls: function()
	{
		$(".stats, .quickstats, .actions, .menu").fadeIn(800);
	},
	goFullscreen: function(event)
	{
		var el = document.documentElement
		var rfs =
		           el.requestFullScreen
		        || el.webkitRequestFullScreen
		        || el.mozRequestFullScreen;
		
		if(rfs!=undefined) rfs.call(el);
	},
	
	canvasCoords: function(screenX, screenY)
	{
		// convert screen coordinates to canvas coordinates
		return {x: Math.round(screenX*this.canvasScale), y: Math.round(screenY*this.canvasScale)};
	},
	
	clear: function()
	{
		this.prerenderContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
		/*this.context.fillStyle = 'rgba(200,200,200,0.2)';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);*/
	},
	
	draw: function ()
	{
		var timeStart = Date.now(), preTime=0, clipTime=0, drawTime=0;
		this.clear();
		
		this.context.lineWidth = 4;
		this.context.fillStyle = '#704630';
		this.context.strokeStyle = '#fff'
		this.prerenderContext.lineWidth = 4;
		this.prerenderContext.fillStyle = '#704630';
		this.prerenderContext.strokeStyle = '#fff';
		
		
		// Prerender Canvas
		GameEngine.map.drawMapGround();
		var rendered = GameEngine.map.prerenderMap();
			preTime = Date.now() - timeStart;
		
		this.fullRenderAgo++;
		if(rendered)
		{
			// Render prerendered Changes on displayed Canvas
			RenderEngine.context.save();
			GameEngine.map.clipCanvas();
			clipTime = Date.now() - timeStart - preTime;
		
			this.context.drawImage(this.prerenderCanvas, 0, 0);
			RenderEngine.context.restore();
			
			this.fullRenderAgo = 0;
		}
			
		var timeDifference = Date.now() - timeStart;
		var drawTime = timeDifference - preTime - clipTime;
		this.showRenderTime(preTime+" | "+clipTime+" | "+drawTime +" = "+timeDifference);
		
		// Save Render Times
		if(this.renderTimes.length>4) this.renderTimes.shift();
		this.renderTimes.push(timeDifference);
		this.renderTimeAvg = (this.renderTimes[0]+this.renderTimes[1]+this.renderTimes[2]+this.renderTimes[3]+this.renderTimes[4])/5;
	},
	requestDraw: function ()
	{
		requestAnimationFrame(function() { RenderEngine.draw(); });
	},
	requestDelayed: function (what)
	{
		var what = RenderEngine[what];
		setTimeout(function(){ requestAnimationFrame(what.bind(RenderEngine)); },50);
	},
	
	drawOverlay: function (e,s,overlay)
	{
		var coords = GameEngine.map.getCanvasCoords(e,s,false);
		coords.x /= this.canvasScale;
		coords.y /= this.canvasScale;
		overlay.appendTo("body");
		overlay.addClass("overlay").css("left",coords.x-overlay.width()/2 +"px").css("top",coords.y-overlay.height()/2+"px");
	},
	removeOverlays: function()
	{
		$("body>.overlay").remove();
	},
	drawCowPrices: function()
	{
		GameEngine.map.tiles.forEach(function(tile)
		{
			if(tile.cows.length>0)
			{
				var cowValue = GameEngine.treatment.cowValue( tile.getOldestCow().age );
				var overlay = $("<div></div>")
				.attr("style","color: #3b3; text-shadow: 1px 2px 2px rgb(0, 0, 0); font-weight: bold; font-size: 1.2em;")
				.html(cowValue+" $");
				/*
					TODO: Better (Cow price) Overlay System nested in Tiles
					tile.overlays.push(overlay);
					tile.draw
				*/
				RenderEngine.drawOverlay(tile.pos.e,tile.pos.s,overlay);
			}
		});
		
	},
	drawDegradationNumber: function()
	{
		GameEngine.map.tiles.forEach(function(tile)
		{
			if(tile.degradation>0)
			{
				var degradation = tile.degradation;
				var color = "0,200,0";
				if(degradation>4) color = degradation>=8 ? "230,0,0" : "200,90,0";
				
				var overlay = $("<div></div>")
				.attr("style","color: rgb("+color+"); text-shadow: 1px 2px 2px rgb(0, 0, 0); font-weight: bold; font-size: 1.2em;")
				.html(degradation);
				RenderEngine.drawOverlay(tile.pos.e,tile.pos.s,overlay);
			}
		});
		
	},
	
	drawQuickstats: function()
	{
		$(".quickstats .round .year").html(GameEngine.treatment.startYear-1 + GameEngine.round.round);
		$(".quickstats .savings span").html( numberWithCommas(GameEngine.round.savings) );
		$(".quickstats .loans span").html( numberWithCommas(GameEngine.round.loans) );
		
		// update cowBuy in case it was deactivated because of lacking savings
		$('a[href="#buycow"]').removeClass("inactive");
		// update Loan Actions
		this.drawLoanActions();
	},
	drawStats: function()
	{
		if(GameEngine.stats)
		{
			$(".fullstats .this.round").show();
			$(".fullstats .this.round .savings .amount").html( numberWithCommas(GameEngine.stats.savings));
			$(".fullstats .this.round .loans .amount").html( numberWithCommas(GameEngine.stats.loans));
			$(".fullstats .this.round .loanInterest .amount").html( numberWithCommas(GameEngine.stats.loanInterest));
			$(".fullstats .this.round .savingsInterest .amount").html( numberWithCommas(GameEngine.stats.savingsInterest));
			$(".fullstats .this.round .repairCost .amount").html( numberWithCommas(0-GameEngine.stats.repairCost));
			$(".fullstats .this.round .personalCost .amount").html( numberWithCommas(0-GameEngine.stats.personalCost));
			
			$(".fullstats .this.round .subsidies .amount").html( numberWithCommas(GameEngine.stats.subsidies));
			$(".fullstats .this.round .tco2 .amount").html( GameEngine.stats.tco2SoldToday +" t CO2" );
			$(".fullstats .this.round .carbonPrice .amount").html( GameEngine.stats.carbonPrice+ " $R" );
			$(".fullstats .this.round .forest .amount").html( GameEngine.stats.forest +" ha" );
			$(".fullstats .this.round .forestPrice .amount").html( GameEngine.stats.forestPrice+ " $R" );
			
			$(".fullstats .this.round .savings.total .amount").html( numberWithCommas(GameEngine.stats.newSavings));
			$(".fullstats .this.round .loan.total .amount").html( numberWithCommas(GameEngine.stats.newLoans));
			$(".fullstats .this.round .loanTransaction .amount").html( numberWithCommas(GameEngine.stats.loanTransaction) );
			
			$(".fullstats .this.round h2").html(GameEngine.treatment.startYear + GameEngine.round.round -2);
			$(".fullstats .this.round .year").html(GameEngine.treatment.startYear + GameEngine.round.round -1);
			
			// Graphs
			$(".fullstats .last.round").show();
			$(".fullstats .last.round h2").html( GameEngine.treatment.startYear +" - "+ (GameEngine.treatment.startYear+GameEngine.round.round-1) );
			
			$(".fullstats .last.round .cowvalue .amount").html( GameEngine.treatment.cowValue(2))
			$(".fullstats .last.round .carbonprice .amount").html( GameEngine.treatment.carbonPrice())
			
				// Resize Graphs
				var graphsAreHidden = $(".fullstats").is(":visible") ? false : true;
				
				if(graphsAreHidden) $(".fullstats").show();
				$(".graph.carbonEmission").height( $(".graph.carbonEmission").width()/3 +10);
				$(".graph.carbon").height( $(".graph.carbon").width()/5 +10);
				$(".graph.cow").height( $(".graph.cow").width()/5 +10);
				if(graphsAreHidden) $(".fullstats").hide();
			
			// Cow Value Graph
			var spacing = Math.min(400/GameEngine.graphs.cowValue.length, 30);
			var points = "", graphMaxValue = 65000, graphMinValue = 10000;
			$.each( GameEngine.graphs.cowValue, function( key, value ) {
				if(key>0) points += ",";
				points += key*spacing+","+ (1-(value-graphMinValue)/(graphMaxValue-graphMinValue))*80;
				
			});
			$(".graph.cow polyline").attr("points",points);
			
			
			// Show and Draw Carbon Price if  enabled in Treatment
			if(GameEngine.treatment.showCarbonSubsidies)
			{
				// Carbon Price Graph
				points = ""; graphMaxValue = 30; graphMinValue = 0;
				$.each( GameEngine.graphs.carbonPrice, function( key, value ) {
					if(key>0) points += ",";
					points += key*spacing+","+ (1-(value-graphMinValue)/(graphMaxValue-graphMinValue))*80;
				});
				$(".graph.carbon polyline").attr("points",points);
				
				
				// Carbon Emission Graph
				$(".graph.carbonEmission line").remove();
				
				var baselinePoints = "";
				var sold, soldToday, actual, actualToday, actualEtSold, prevActualEtSold;
				var grStyle = "stroke:rgb(0,220,0); stroke-width:6",
					rStyle = "stroke:rgb(220,0,0); stroke-width:4",
					blStyle = "stroke:rgb(0,0,0); stroke-width:2",
					lineStyle = "stroke: #ccc;stroke-width:1";
				var showBefore = Math.min(7,GameEngine.graphs.soldTotal.length);
				var scaleY = GameEngine.round.round>15 ? 0.0015 : 0.0025;
				var offsetY, amountX = 12;
				
				for(var i=0; i<=amountX; i++)
				{
					round = GameEngine.round.round-showBefore+i;
					var baseline = GameEngine.treatment.baseline(round);
					
					actual = GameEngine.graphs.actualTotal[round-1];
						if(isNaN(actual)) actual = 0;
					actualToday = GameEngine.graphs.actualTotal[round-1]-GameEngine.graphs.actualTotal[round-2];
						if(isNaN(actualToday)) actualToday = actual;
					sold = GameEngine.graphs.soldTotal[round-1];
						if(isNaN(sold)) sold = 0;
					soldToday = GameEngine.graphs.soldTotal[round-1]-GameEngine.graphs.soldTotal[round-2];
						if(isNaN(soldToday)) soldToday = sold;
					actualEtSold = sold+actual;
					
					prevActualEtSold = GameEngine.graphs.actualTotal[round-2] + GameEngine.graphs.soldTotal[round-2];
						if(!prevActualEtSold) prevActualEtSold = 0;
					
					if(!offsetY) offsetY = Math.max((GameEngine.treatment.baseline(GameEngine.round.round-1)*scaleY)+100,200);
					var x = Math.round(i*600/amountX);
					
					if(actualEtSold)
					{
						var y1 = offsetY-prevActualEtSold*scaleY;
						$(".graph.carbonEmission").append(
							svgLine(x-600/amountX,y1, x,y1,blStyle)
						);
						if(actualToday>0)
						{
							$(".graph.carbonEmission").append(
								svgLine(x,y1, x,y1-actualToday*scaleY, rStyle)
							);
						}
						if(soldToday>0)
						{
							$(".graph.carbonEmission").append(
								svgLine(x,y1-actualToday*scaleY, x,y1-actualToday*scaleY-soldToday*scaleY, grStyle)
							);
						}
					}
					
					if(baselinePoints!="") baselinePoints += ",";
					baselinePoints += x+","+ Math.round(offsetY-baseline*scaleY);
				};
				
				$(".graph.carbonEmission polyline.baseline").attr("points",baselinePoints);
				$(".graph.carbonEmission").prepend(svgLine(0,150+offsetY%50, 600,150+offsetY%50, lineStyle));
				$(".graph.carbonEmission").prepend(svgLine(0,100+offsetY%50, 600,100+offsetY%50, lineStyle));
				$(".graph.carbonEmission").prepend(svgLine(0,50+offsetY%50, 600,50+offsetY%50, lineStyle));
				$(".graph.carbonEmission").prepend(svgLine(0,0+offsetY%50, 600,0+offsetY%50, lineStyle));
				
				$(".fullstats .this.round").find(".forest, .forestPrice").hide();
			}
			else if(GameEngine.treatment.showForestSubsidies)
			{
				$(".fullstats .this.round").find(".forest, .forestPrice").show();
				
				$(".fullstats .this.round").find(".tco2, .carbonPrice").hide();
				$(".last.round .section.carbon").hide();
				$(".window .carbonExpectation").hide();
			}
			else
			{
				$(".fullstats .this.round").find(".tco2, .carbonPrice, .forest, .forestPrice, .subsidies").hide();
				$(".last.round .section.carbon").hide();
				$(".window .carbonExpectation").hide();
			}
		}
		else
		{
			$(".fullstats .this.round").hide();
			$(".fullstats .last.round").hide();
		}
		
		this.drawLoanActions();
	},
	drawLoanActions: function()
	{
		var amount = GameEngine.treatment.loanIncrement;
		if(amount>GameEngine.round.savings) amount = GameEngine.round.savings;
		if(amount>GameEngine.round.loans) amount = GameEngine.round.loans;
		$('a[href="#amortizeloan"] span.price').html( numberWithCommas(0-amount) +" R$");
		
		var takeAmount = GameEngine.treatment.loanIncrement;
		if(GameEngine.round.loans+GameEngine.treatment.loanIncrement > GameEngine.treatment.loanLimit) takeAmount = GameEngine.treatment.loanLimit-GameEngine.round.loans;
		$('a[href="#takeloan"] span.price').html( numberWithCommas(takeAmount) +" R$");
		
		$('a[href="#amortizeloan"]').removeClass("inactive");
		$('a[href="#takeloan"]').removeClass("inactive");
		if(GameEngine.round.loans>=GameEngine.treatment.loanLimit)
			$('a[href="#takeloan"]').addClass("inactive");
		if(GameEngine.round.savings<=0 || GameEngine.round.loans==0)
			$('a[href="#amortizeloan"]').addClass("inactive");
	},
	drawConfirm: function()
	{
		// Display next round button when not selecting
		if(!InputEngine.selecting)
		{
			$(".confirm .costs").show().css("opacity",1);
			$(".confirm").hide();
			$(".nextround").removeClass("inactive");
			return;
		}
		
		// Display Confirm Buttons when selection
		$(".confirm .licence, .confirm .sellall, .confirm .fillintensified").hide();
		
		if(InputEngine.selectAction=="moveCow")
		{
			$(".confirm .costs").css("opacity",0);
		}
		else if(InputEngine.selectAction=="buyCow" && GameEngine.round.intensified>0)
		{
			$(".confirm .fillintensified").show();
		}
		else if(InputEngine.selectAction=="sellCow")
		{
			$(".confirm .sellall").show();
		}
		else if(InputEngine.selectAction=="deforest" && !GameEngine.round.deforestLicence && GameEngine.treatment.deforestLicenceCost>0)
		{
			$(".confirm .licence").show();
		}
				
		$(".confirm").show();
		$(".nextround").addClass("inactive");
		
		$(".confirm .costs span").html(numberWithCommas(GameEngine.actionRevenue) );
		
		if(InputEngine.allowCancel) 
		{
			$(".confirm a.cancel").show();
		}
		else
		{
			$(".confirm a.cancel").hide();
		}
		
		if(GameEngine.actionCostUnsecured)
		{	$(".confirm .costs").addClass("unsecured"); }
		else
		{	$(".confirm .costs").removeClass("unsecured"); }
		
		if(GameEngine.actionBlocked)
		{	$(".confirm a.accept").addClass("inactive"); }
		else
		{	$(".confirm a.accept").removeClass("inactive"); }
	},
	drawActionButtons: function()
	{
		if(InputEngine.selecting) 
		{
			$(".actions a").addClass("inactive");
			$(".actions a.active").removeClass("inactive");
		}
		else
		{
			$(".actions a").removeClass("active").removeClass("inactive");
		}
		
		var oldestCow = GameEngine.map.getOldestCow();
		if(!oldestCow)
		{
			$('a[href="#sellcow"]').addClass("inactive");
		}
		else
		{
			$('a[href="#sellcow"]').removeClass("inactive");
		}
	},
	
	showCursorImage: function(image)
	{
		this.cursorImage = image;
		$(".cursorImage img").attr("src",this.cursorImage.src).width(this.cursorImage.width/this.canvasScale).height(this.cursorImage.height/this.canvasScale);
		$(".cursorImage").show().css("left",InputEngine.previousDragPos.x-this.cursorImage.width/2).css("top",InputEngine.previousDragPos.y-this.cursorImage.height-20);
	},
	hideCursorImage: function(image)
	{
		this.cursorImage = null;
		$(".cursorImage").hide();
	},
	updateCursorImage: function(x,y)
	{
		if(this.cursorImage) $(".cursorImage").css("left",x-this.cursorImage.width/2).css("top",y-this.cursorImage.height-20);
	},
	
	textLog: function(text)
	{
		var textBox = $("<div></div>").html(text);
		$(".textOut").append(textBox);
	},
	
	showDialog: function(windowname)
	{
		$(".dialog").fadeIn(400);
		$(".window").hide();
		$(".window."+windowname).show();
	},
	closeWindow: function(window)
	{
		window.hide();
		if($(".dialog .window:visible").length==0) $(".dialog").fadeOut(400);
	},
	
	showRenderTime: function(text)
	{
		$(".renderTime").html(text);
	},
	showtickTime: function(text)
	{
		$(".tickTime").html(text);
	},
	
	exitFullscreen: function()
	{
		if (document.exitFullscreen) {
		    document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		}
		else if (document.webkitCancelFullScreen) {
		    document.webkitCancelFullScreen();
		}
	}
	
	
});

var RenderEngine = new RenderEngineClass();