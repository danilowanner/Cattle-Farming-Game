NetworkClass = Class.extend({
	
	data: null,
	
	loadGame: function (callback)
	{
		this.data = new Object();
		
		// load Game
		$.getJSON("server.php",
			{ get: "game", order: "time DESC" },
			function(game)
			{
				if(game.error)
				{
					alert("Error loading Game: "+game.error);
				}
				else
				{
					console.log("Game loaded:");
					console.log(game);
					Network.data.game = game;
					Network.loadPlayer(callback);
				}
			}
		);
	},
	loadPlayer: function (callback)
	{
		// load Player
		$.getJSON("server.php",
			{ get: "player" },
			function(player)
			{
				if(!player)
				{
					alert("Error loading Game: No existing Player. Create Player first.");
					window.location = "index.html";
					return;
				}
				console.log("Player loaded");
				console.log(player);
				Network.data.player = player;
				Network.loadRound(callback);
			}
		);
	},
	loadRound: function (callback)
	{
		// load Round
		$.getJSON("server.php",
			{ get: "round", order: "time DESC" },
			function(round)
			{
				console.log("Round loaded");
				console.log(round);
				Network.data.round = round;
				Network.loadTreatment(callback);
			}
		);
	},
	loadTreatment: function (callback)
	{
		// load Treatment
		$.getJSON("server.php",
			{ get: "treatment", where: "id="+Network.data.game.treatment },
			function(treatment)
			{
				console.log("Treatment loaded");
				
				// Create Functions from Function Strings
				for(var index in treatment) {
					if( typeof treatment[index] === 'string' && treatment[index].startsWith("function(") )
					{
						treatment[index] = eval( "("+ treatment[index] +")" );
					}
				}
				console.log(treatment);
				Network.data.treatment = treatment;
				callback(Network.data);
			}
		);
	},
	
	refreshGlobals: function()
	{
		Network.loadGlobals()
		setTimeout(Network.refreshGlobals, 5000);
	},
	loadGlobals: function ()
	{
		// load Treatment
		$.getJSON("server.php",
			{ get: "globalSettings" },
			function(globals)
			{
				GameEngine.loadGlobalsSuccess(globals);
			}
		);
	},
	
	saveRound: function(round,callback)
	{
		var callback = callback ? callback : false;
		
		console.log("save Round");
		console.log( copy(round) );
		
		// Save Round
		$.post("server.php?insert=round",
			round,
			function(data)
			{
				console.log("Round saved: "+data);
				if(callback) callback();
			}
		);
	},
	finishGame: function(callback)
	{
		console.log("finish Game");
		
		// Save Round
		this.saveRound(GameEngine.round,
			function()
			{
				// Set Game to finished
				$.post("server.php?update=game&where=id%3d"+GameEngine.game.id,
					{ finished: true  },
					function(data)
					{
						console.log("game finished: "+data);
						callback();
					}
				);
			});
	}
});

var Network = new NetworkClass();