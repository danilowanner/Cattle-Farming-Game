AssetLoaderClass = Class.extend({

	gCachedAssets: {},
	
	loadAssets: function(assetList, callbackFcn) {
		// All the information we need to keep track of
		// for this batch.
		var loadBatch = {
			count: 0,
			total: assetList.length,
			cb: callbackFcn
		};
		
		for(var i = 0; i < assetList.length; i++) {
			if(AssetLoader.gCachedAssets[assetList[i]] == null) {
				var assetType = AssetLoader.getAssetTypeFromExtension(assetList[i]);
				
				if(assetType === 0) { // Asset is an image
					var img = new Image();
					img.onload = function () {
						AssetLoader.onLoadedCallback(loadBatch);
					};
					img.src = "assets/images/"+assetList[i]+"?v="+Math.floor(Math.random()*100000);
					AssetLoader.gCachedAssets[assetList[i]] = img;
					
	
				} else if(assetType === 1) { // Asset is Javascript
					var fileref = document.createElement('script');
					fileref.setAttribute("type", "text/javascript");
					fileref.onload = function (e){
						AssetLoader.onLoadedCallback(loadBatch);
					};
					fileref.setAttribute("src", assetList[i]+"?v="+Math.ceil(Math.random()*1000) );
					document.getElementsByTagName("head")[0].appendChild(fileref);
					AssetLoader.gCachedAssets[assetList[i]] = fileref;
				}
	
			} else { // Asset is already loaded
				AssetLoader.onLoadedCallback(loadBatch);
			}
		}
	},
	
	loadAssetsForEntityClasses: function(entityClasses,callback)
	{
		var assetList = new Array();
		for(var i = 0; i < entityClasses.length; i++)
		{
			var entityClass = new entityClasses[i];
			for (var size in entityClass.forms) {
				for (var formname in entityClass.forms[size]) {
					var form = entityClass.forms[size][formname];
					assetList.push(form.image);
				}
			}
		}
		this.loadAssets(assetList,callback);
	},
	
	get: function(assetName) {
		if(this.gCachedAssets[assetName]==undefined) console.log(assetName+" asset not loaded")
		return this.gCachedAssets[assetName];	
	},
	
	onLoadedCallback: function(batch) {
		// If the entire batch has been loaded,
		// call the callback.
		batch.count++;
		if(batch.count == batch.total) {
			batch.cb(this.gCachedAssets);
		}
	},
	
	getAssetTypeFromExtension: function(fname) {
		if(fname.indexOf('.jpg') != -1 || fname.indexOf('.jpeg') != -1 || fname.indexOf('.png') != -1 || fname.indexOf('.gif') != -1 || fname.indexOf('.wp') != -1) {
			// It's an image!
			return 0;
		}
	
		if(fname.indexOf('.js') != -1 || fname.indexOf('.json') != -1) {
			// It's javascript!
			return 1;
		}
	
		// Uh Oh
		return -1;
	}
});

AssetLoader = new AssetLoaderClass();