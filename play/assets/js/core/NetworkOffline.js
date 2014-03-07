NetworkClass = Class.extend({
	
	data: null,
	
	loadGame: function (callback)
	{
		this.data = new Object();
		
		// define Game
		Network.data.game = {"id":32,"playerID":3,"time":"2013-11-12 22:10:53","treatment":8,"finished":0};
		Network.loadPlayer(callback);
	},
	loadPlayer: function (callback)
	{
		// define Player
		Network.data.player = {"id":3,"time":"2013-11-12 22:09:48","treatment":3,"name":"Test User","age":27,"gender":"m","role":"Owner","experience":2010,"risk":5,"financialRisk":5,"productionModel":"calves","farmSize":23,"pastureSize":10,"degradedSize":0,"forestSize":13,"deforestation":2,"landAcquisition":0,"otherProducts":1,"agriTechnologies":"Extensive Grazing only"};
		Network.loadRound(callback);
	},
	loadRound: function (callback)
	{
		// define Round
		Network.data.round = {"id":145,"playerID":3,"gameID":32,"round":0,"cowPriceExpectation":null,"carbonPriceExpectation":null,"time":"2013-11-12 22:10:53","savings":1500000,"loans":0,"subsidies":0,"actual":0,"tco2":0,"tco2Sold":0,"cowsSold":0,"cowsBought":0,"deforested":0,"intensified":0,"restored":0,"deforestLicence":0,"landValue":null,"avgDegradation":null};
		Network.loadTreatment(callback);
	},
	loadTreatment: function (callback)
	{
		// load Treatment
		var trainingTreatment = {"id":8,"Treatment Name":"Training Round","startPastureTileNum":13,"startYear":2015,"endYear":2041,"restoreCost":35000,"deforestCost":18000,"intensifyCost":42000,"minIntensifyTiles":1,"cowCost":"function() {\r\n  var cowValue = GameEngine.treatment.cowValue(0);\r\n  return Math.round(2500+3000+cowValue);\r\n}","cowValue":"function(age) {\r\n  var round = GameEngine.round.round;\r\n  switch(round)\r\n  {\r\n  case 1: var price = 40000; break;\r\n  case 2: var price = 40000; break;\r\n  case 3: var price = 40000; break;\r\n  case 4: var price = 40000; break;\r\n  case 5: var price = 38000; break;\r\n  case 6: var price = 36000; break;\r\n  case 7: var price = 35000; break;\r\n  case 8: var price = 38000; break;\r\n  case 9: var price = 42000; break;\r\n  case 10: var price = 45000; break;\r\n  case 11: var price = 48000; break;\r\n  case 12: var price = 43000; break;\r\n  case 13: var price = 40000; break;\r\n  case 14: var price = 42000; break;\r\n  case 15: var price = 44000; break;\r\n  case 16: var price = 41000; break;\r\n  case 17: var price = 40000; break;\r\n  case 18: var price = 43000; break;\r\n  case 19: var price = 45000; break;\r\n  case 20: var price = 46000; break;\r\n  case 21: var price = 45000; break;\r\n  case 22: var price = 42000; break;\r\n  case 23: var price = 38000; break;\r\n  case 24: var price = 36000; break;\r\n  case 25: var price = 35000; break;\n  case 26: var price = 34000; break;\n  case 27: var price = 32000; break;\r\n\r\n\r\n  default: var price = 40000;\r\n  }\r\n  if(age==0) price *= 0.5;\r\n  if(age==1) price *= 0.7;\r\n  return Math.round(price - price * 0.0);\r\n}","savingsInterest":"function() {\r\n  return Math.round(0.00*GameEngine.round.savings);\r\n}","loanInterest":"function() {\r\n  var interest = Math.min(GameEngine.treatment.loanLimit,GameEngine.round.loans)*0.03 + Math.max(0,GameEngine.round.loans-GameEngine.treatment.loanLimit)*0.25;\r\n  return Math.round(interest);\r\n}","repairCost":"function() {\r\n  var costs = 8000 * GameEngine.round.intensified;\n  return costs;\r\n}","deforestLicenceCost":0,"personalCost":50000,"baseline":"function(round) {\r\nif(!round) var round = GameEngine.round.round;  switch(round)\r\n  {\r\n    case 1: var Baseline = 1.0000; break;\r\n    case 2: var Baseline = 2.0200; break;\r\n    case 3: var Baseline = 3.0600; break;\r\n    case 4: var Baseline = 4.1400; break;\r\n    case 5: var Baseline = 5.2600; break;\r\n    case 6: var Baseline = 6.4300; break;\r\n    case 7: var Baseline = 7.6600; break;\r\n    case 8: var Baseline = 8.9600; break;\r\n    case 9: var Baseline = 10.3400; break;\r\n    case 10: var Baseline = 11.8100; break;\r\n    case 11: var Baseline = 13.3800; break;\r\n    case 12: var Baseline = 15.0600; break;\r\n    case 13: var Baseline = 16.8600; break;\r\n    case 14: var Baseline = 18.7800; break;\r\n    case 15: var Baseline = 20.8400; break;\r\n    case 16: var Baseline = 23.0400; break;\r\n    case 17: var Baseline = 25.4000; break;\r\n    case 18: var Baseline = 27.9200; break;\r\n    case 19: var Baseline = 30.6200; break;\r\n    case 20: var Baseline = 33.5000; break;\r\n    case 21: var Baseline = 36.5800; break;\r\n    case 22: var Baseline = 39.8600; break;\r\n    case 23: var Baseline = 43.3500; break;\r\n    case 24: var Baseline = 47.0600; break;\r\n    case 25: var Baseline = 51.0000; break;\r\n    \r\n    default: var Baseline = 0;\r\n  }\r\n  return Baseline*5000;\r\n}","actual":"function()\n{\n\treturn GameEngine.round.deforested * 5000;\n}","tco2":"function() {\n\tvar baseline = GameEngine.treatment.baseline();\r\n\tvar actual = GameEngine.treatment.actual();\r\n\treturn Math.round(baseline - actual);\r\n}","carbonPrice":"function() {\r\n  \r\n  return 0;\r\n}","forest":"function() {\n\treturn (64 - GameEngine.treatment.startPastureTileNum - GameEngine.round.deforested) * 25;\n}","forestPrice":"function() {\n\treturn 0;\n}","subsidies":"function() {\r\n \r\n  return 0;\r\n}","showCarbonSubsidies":0,"showForestSubsidies":0,"loanIncrement":100000,"loanLimit":0,"showDialogs":"function()\n{\n}","landValue":"function()\n{\n\tvar pasture = GameEngine.treatment.startPastureTileNum + GameEngine.round.deforested - GameEngine.round.intensified;\n\tvar forest = 64 - GameEngine.treatment.startPastureTileNum - GameEngine.round.deforested;\n\tvar intensified = GameEngine.round.intensified;\n\tvar avgDegradation = GameEngine.round.avgDegradation;\n\n\treturn pasture*(45000-2000*avgDegradation) + forest*25000 + intensified*65000;\n}  "};
		
		var volatileCarbonTreatment = {"id":1,"Treatment Name":"Treatment 1: Volatile Carbon Price","startPastureTileNum":13,"startYear":2015,"endYear":2061,"restoreCost":35000,"deforestCost":18000,"intensifyCost":42000,"minIntensifyTiles":1,"cowCost":"function() {\r\n var cowValue = GameEngine.treatment.cowValue(0);\r\n return Math.round(2500+3000+cowValue);\r\n}","cowValue":"function(age) {\r\n var round = GameEngine.round.round;\r\n switch(round)\r\n {\r\n case 1: var price = 39500; break;\r\n case 2: var price = 38500; break;\r\n case 3: var price = 36000; break;\r\n case 4: var price = 33000; break;\r\n case 5: var price = 38000; break;\r\n case 6: var price = 40000; break;\r\n case 7: var price = 41000; break;\r\n case 8: var price = 42500; break;\r\n case 9: var price = 44500; break;\r\n case 10: var price = 41000; break;\r\n case 11: var price = 39000; break;\r\n case 12: var price = 38000; break;\r\n case 13: var price = 42500; break;\r\n case 14: var price = 46000; break;\r\n case 15: var price = 51000; break;\r\n case 16: var price = 42000; break;\r\n case 17: var price = 44000; break;\r\n case 18: var price = 40000; break;\r\n case 19: var price = 41000; break;\r\n case 20: var price = 39000; break;\r\n case 21: var price = 37000; break;\r\n case 22: var price = 33500; break;\r\n case 23: var price = 31000; break;\r\n case 24: var price = 34000; break;\r\n case 25: var price = 32000; break;\r\n case 26: var price = 29000; break;\r\n case 27: var price = 27000; break;\r\n case 28: var price = 30000; break;\r\n case 29: var price = 39000; break;\r\n case 30: var price = 40000; break;\r\n case 31: var price = 45000; break;\r\n case 32: var price = 47000; break;\r\n case 33: var price = 51000; break;\r\n case 34: var price = 48500; break;\r\n case 35: var price = 47000; break;\r\n case 36: var price = 50500; break;\r\n case 37: var price = 51500; break;\r\n case 38: var price = 49000; break;\r\n case 39: var price = 54000; break;\r\n case 40: var price = 50000; break;\r\n case 41: var price = 58000; break;\r\n case 42: var price = 60000; break;\r\n case 43: var price = 63000; break;\r\n case 44: var price = 62000; break;\r\n case 45: var price = 65000; break;\r\n \r\n\r\n default: var price = 65000;\r\n }\r\n if(age==0) price *= 0.5;\r\n if(age==1) price *= 0.7;\r\n return Math.round(price - price * 0.0);\r\n}","savingsInterest":"function() {\r\n return Math.round(0.00*GameEngine.round.savings);\r\n}","loanInterest":"function() {\r\n var interest = Math.min(GameEngine.treatment.loanLimit,GameEngine.round.loans)*0.03 + Math.max(0,GameEngine.round.loans-GameEngine.treatment.loanLimit)*0.25;\r\n return Math.round(interest);\r\n}","repairCost":"function() {\r\n var costs = 8000 * GameEngine.round.intensified;\n return costs;\r\n}","deforestLicenceCost":0,"personalCost":50000,"baseline":"function(round) {\r\nif(!round) var round = GameEngine.round.round; switch(round)\r\n {\r\n case 1: var Baseline = 1.0000; break;\r\n case 2: var Baseline = 2.0200; break;\r\n case 3: var Baseline = 3.0600; break;\r\n case 4: var Baseline = 4.1400; break;\r\n case 5: var Baseline = 5.2600; break;\r\n case 6: var Baseline = 6.4300; break;\r\n case 7: var Baseline = 7.6600; break;\r\n case 8: var Baseline = 8.9600; break;\r\n case 9: var Baseline = 10.3400; break;\r\n case 10: var Baseline = 11.8100; break;\r\n case 11: var Baseline = 13.3800; break;\r\n case 12: var Baseline = 15.0600; break;\r\n case 13: var Baseline = 16.8600; break;\r\n case 14: var Baseline = 18.7800; break;\r\n case 15: var Baseline = 20.8400; break;\r\n case 16: var Baseline = 23.0400; break;\r\n case 17: var Baseline = 25.4000; break;\r\n case 18: var Baseline = 27.9200; break;\r\n case 19: var Baseline = 30.6200; break;\r\n case 20: var Baseline = 33.5000; break;\r\n case 21: var Baseline = 36.5800; break;\r\n case 22: var Baseline = 39.8600; break;\r\n case 23: var Baseline = 43.3500; break;\r\n case 24: var Baseline = 47.0600; break;\r\n case 25: var Baseline = 51.0000; break;\r\n \r\n default: var Baseline = 0;\r\n }\r\n return Baseline*5000;\r\n}","actual":"function()\n{\n\treturn GameEngine.round.deforested * 5000;\n}","tco2":"function() {\n\tvar baseline = GameEngine.treatment.baseline();\r\n\tvar actual = GameEngine.treatment.actual();\r\n\treturn Math.round(baseline - actual);\r\n}","carbonPrice":"function() {\r\n var round = GameEngine.round.round;\r\n switch(round)\r\n {\r\n case 1: var carbonPrice = 25.66; break;\r\n case 2: var carbonPrice = 24.60; break;\r\n case 3: var carbonPrice = 26.50; break;\r\n case 4: var carbonPrice = 23.73; break;\r\n case 5: var carbonPrice = 19.38; break;\r\n case 6: var carbonPrice = 9.38; break;\r\n case 7: var carbonPrice = 6.42; break;\r\n case 8: var carbonPrice = 0.00; break;\r\n case 9: var carbonPrice = 8.74; break;\r\n case 10: var carbonPrice = 14.38; break;\r\n case 11: var carbonPrice = 19.33; break;\r\n case 12: var carbonPrice = 20.90; break;\r\n case 13: var carbonPrice = 29.88; break;\r\n case 14: var carbonPrice = 25.45; break;\r\n case 15: var carbonPrice = 25.63; break;\r\n case 16: var carbonPrice = 28.30; break;\r\n case 17: var carbonPrice = 27.95; break;\r\n case 18: var carbonPrice = 24.64; break;\r\n case 19: var carbonPrice = 21.33; break;\r\n case 20: var carbonPrice = 15.66; break;\r\n case 21: var carbonPrice = 9.32; break;\r\n case 22: var carbonPrice = 19.37; break;\r\n case 23: var carbonPrice = 24.09; break;\r\n case 24: var carbonPrice = 23.06; break;\r\n case 25: var carbonPrice = 26.32; break;\r\n \r\n default: var carbonPrice = 0;\r\n }\r\n return Math.round(carbonPrice * 10) \/ 10;\r\n}","forest":"function() {\n\treturn (64 - GameEngine.treatment.startPastureTileNum - GameEngine.round.deforested) * 25;\n}","forestPrice":"function() {\n\treturn 0;\n}","subsidies":"function() {\r\n return Math.round(GameEngine.stats.tco2SoldToday * GameEngine.treatment.carbonPrice());\r\n}","showCarbonSubsidies":1,"showForestSubsidies":0,"loanIncrement":100000,"loanLimit":0,"showDialogs":"function()\n{\n\tif(GameEngine.round.round%4==1) RenderEngine.showDialog(\"playerExpectation\");\n}","landValue":"function()\n{\n\tvar pasture = GameEngine.treatment.startPastureTileNum + GameEngine.round.deforested - GameEngine.round.intensified;\n\tvar forest = 64 - GameEngine.treatment.startPastureTileNum - GameEngine.round.deforested;\n\tvar intensified = GameEngine.round.intensified;\n\tvar avgDegradation = GameEngine.round.avgDegradation;\n\n\treturn pasture*(45000-2000*avgDegradation) + forest*25000 + intensified*65000;\n} "};
		
		var treatment = volatileCarbonTreatment;
		
		// Create Functions from Function Strings
		for(var index in treatment) {
			if( typeof treatment[index] === 'string' && treatment[index].startsWith("function(") )
			{
				treatment[index] = eval( "("+ treatment[index] +")" );
			}
		}
		Network.data.treatment = treatment;
		callback(Network.data);
	},
	
	refreshGlobals: function()
	{
		Network.loadGlobals()
		setTimeout(Network.refreshGlobals, 20000);
	},
	loadGlobals: function ()
	{
		GameEngine.loadGlobalsSuccess([{"id":1,"key":"enableRealButton","value":0},{"id":2,"key":"enableMusic","value":1}]);
	},
	
	saveRound: function(round,callback)
	{
		var callback = callback ? callback : false;
		
		if(callback) callback();
	},
	finishGame: function(callback)
	{
		console.log("finish Game");
		
		callback();
	}
});

var Network = new NetworkClass();