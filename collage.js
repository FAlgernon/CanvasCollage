
/* ******************************************************

	Canvas Collage

/* ******************************************************/
window.uiCollage = (function(){
	var _self = this;
	var canvas = document.getElementById("uiCollage");
   	var context = canvas.getContext('2d');
   	var uiMenu = document.getElementById("uiCollageMenu");
   	var uiMenuBackgrounds = document.getElementById("uiBackgroundsList");
	var width = 600;
	var height = 600;
	var formats = {};
	var images = [];
	var collageItems = [];
	var imagesRef = [];
	var mousePosition = {};
	var assets=[];
	this.inpoly=-1;
	this.assetsLoaded = 0;
	this.assetsFailed = 0;
	this.totalAssets = 0;
	var frmStorage = document.getElementById("uiCollageData");
	var assetLib = [];
		assetLib["backgrounds"] = [
			{type:"image", name:"Design 1", url:"assets/bg/bg1.png"},
			{type:"image", name:"Design 2", url:"assets/bg/bg2.png"},
			{type:"image", name:"Design 3", url:"assets/bg/bg3.png"},
			{type:"image", name:"White", url:"assets/bg/bg5.png"},
			{type:"image", name:"Black", url:"assets/bg/bg4.png"}
		];

	var layoutLib = [];
		layoutLib["Default"] = {
			sections:[
					[27,26, 296,25, 296,575, 26,575],
					[317,26, 586,25, 586,198, 316,198],
					[317,403, 586,402, 586,575, 316,575],
					[317,215, 586,214, 586,387, 316,387]
				]
			};

	var currentLayout = layoutLib["Default"];
	var currentBackground = 2;
	var assetBag;

	canvas.addEventListener('click', function(evt){
		mousePosition = getMousePos(canvas, evt);
		_self.inpoly=inPolygon(mousePosition);
		if(_self.inpoly>-1){
			addImage(_self.inpoly);
		}else{
			changeBackground();
		}

	}, false);


	addAssets(assetLib["backgrounds"]); // load assets - TODO finish dispatch event when assets loaded to start app
	assetBag = assets;



	//==================================
	// INIT
	//==================================
	function init(){

		canvas.width=width;
		canvas.height=height;
		loadAssets();

		images = new Array(currentLayout.sections.length);

		createBackgroundsMenu();

		//Use for ui feedback for canvas "hover" interactions on objects
		canvas.addEventListener('mousemove', function(evt) {
		
			mousePosition = getMousePos(canvas, evt);
			_self.inpoly=inPolygon(mousePosition); //set index of polygon mouse is over
	
			draw();
		
		});
	
	}


	function inPolygon(mousePosition){
		
		for (var i=0; i<currentLayout.sections.length; i++){
			if(pnpoly2(currentLayout.sections[i], mousePosition.x, mousePosition.y)){
				return i;
				
			}
		}
		return -1;
	}

	function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
          mouseInCanvas: true
        };
      }



	//==================================
	// INIT
	//==================================
	function start(){
		draw();
	}

	//==================================
	// Apply Image
	// After loading the image, add to data array and draw
	//==================================
	function applyImage(e){
		var tmpImage = new Image();
		tmpImage.src = e.target.result
		//images.push(tmpImage);
		images[self.inpoly] = tmpImage;
		//imagesRef.push(e.target.result);
		draw();
	}

	//==================================
	// Create Collage Item
	// based on the area clicked, attach coords and store an image
	//==================================
	function createCollageItem(){

	}

	//==================================
	// Change Background
	// 
	//==================================
	function changeBackground(background){
		currentBackground=(currentBackground==assets.length-1)?0:currentBackground+1;
	}

	//==================================
	// Add Image
	// Create form and select image from file system
	//==================================
	function addImage(imgID){
		
		var newFrmItem = document.createElement("input");
		newFrmItem.type = "file";

		frmStorage.appendChild(newFrmItem);

		newFrmItem.onchange = function(){
			//console.log("changed");
	        if (this.files && this.files[0]) {
	            var reader = new FileReader();
	            reader.onload = uiCollage.applyImage;
	            reader.readAsDataURL(this.files[0]);
	        }
    	};

    	newFrmItem.click();

	}

	//==================================
	// Draw
	// Put the things on the canvas
	//==================================
	function draw(){
		context.clearRect(0, 0, canvas.width, canvas.height);

		//Draw background
		
		drawTile(assets[currentBackground]);

		//draw images
		for(var i=0; i<currentLayout.sections.length;i++){
			context.save();
			context.fillStyle = "rgba(255,255,255,0.35)";
			
				context.beginPath();
			    context.moveTo(currentLayout.sections[i][0], currentLayout.sections[i][1]); // top left
			    
			    for(var x=2;x<currentLayout.sections[i].length;x++)
			    	context.lineTo(currentLayout.sections[i][x],currentLayout.sections[i][++x]); // top right
			    
			    //context.lineTo(currentLayout.sections[i][0], currentLayout.sections[i][1]);

			    context.closePath();

			    //console.log("inpoly",inpoly,i);
			    if(inpoly==i){
			    	context.strokeStyle = '#b4da55';
			    	context.lineWidth = 5;
			    	context.stroke();
			    }

      			context.fill();
			    context.clip();

			    
			if(images[i]){	
				drawImageScaleCenter(images[i], getPolygonSize(currentLayout.sections[i]));
			}

  					
  			context.restore();
		}
		
	}

	//==================================
	// getPolygonSize
	// returns object with width, height, bounds of polygon
	//==================================
	function getPolygonSize(vector){
		var maxX = vector[0];
		var minX = vector[0];
		var maxY = vector[1];
		var minY = vector[1];

		for(i=0; i<vector.length;i++){
			//check x's
			if(vector[i] > maxX)
            	maxX = vector[i];
            else if (vector[i] < minX)
            	minX = vector[i];

            //check y's
            i++;
            if(vector[i] > maxY)
            	maxY = vector[i];
            else if (vector[i] < minY)
            	minY = vector[i];
                       
		}

		return {
			width : maxX-minX,
			height : maxY-minY,
			maxY : maxY,
			maxX : maxX,
			minX : minX,
			minY : minY
		}
	}

	//==================================
	// DrawTile
	// repeat an image across the canvas
	//==================================
	function drawTile(asset){
		//console.log("draw tiles", asset.img);
		if(asset.img!='undefined'){
			var cols = Math.ceil(canvas.width/asset.img.width);
			var rows = Math.ceil(canvas.height/asset.img.height);
			//console.log("drawtiles", cols,rows);

			for (var i=0;i<rows;i++){
	      		for (var j=0;j<cols;j++){
	        		context.drawImage(asset.img,j*asset.img.width,i*asset.img.height,asset.img.width,asset.img.height);
	      		}
	    	}
    	}
	}

	//==================================
	// drawImageScaleCenter
	// draw and scale image into vector area
	//==================================
	function drawImageScaleCenter(img, bounds){
		var hRatio = bounds.width  / img.width;
		var vRatio =  bounds.height / img.height ;
		var ratio  = Math.max(hRatio, vRatio);
		var shiftX = (bounds.width - img.width*ratio) / 2;
		var shiftY = (bounds.height - img.height*ratio) / 2;

		//context.drawImage(img, 0,0, img.width, img.height,
		//	bounds.minX+shiftX,bounds.minY+shiftY,img.width*ratio, img.height*ratio);
		context.drawImage(img, bounds.minX+shiftX,bounds.minY+shiftY, img.width*ratio, img.height*ratio);  
	}

	//==================================
	// PNPOLY
	/*//https://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
	nvert - Number of vertices in the polygon.
	vertx, verty - Arrays containing the x- and y-coordinates of the polygon's vertices.
	testx, testy - X- and y-coordinate of the test point.*/
	//==================================
	function pnpoly( nvert, vertx, verty, testx, testy ) {
	    var i, j, c = false;
	    for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
	        if( ( ( verty[i] > testy ) != ( verty[j] > testy ) ) &&
	            ( testx < ( vertx[j] - vertx[i] ) * ( testy - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
	                c = !c;
	        }
	    }
	    return c;
	}

	//==================================
	// INIT
	// polygon - array of alternating x,y coordinates
	//==================================
	function pnpoly2( polygon, testx, testy ) {
	    //var i, j, c = false;
	    var vertx = [];
	    var verty = [];
	    nvert = polygon.length/2;
	    for(i=0;i<polygon.length;i++){
	    	vertx.push(polygon[i++]);
	    	verty.push(polygon[i]);
	    }

	    return pnpoly(polygon.length, vertx, verty, testx, testy);
	}

	//==================================
	// loadAssets
	// load the collection of assets - 
	// rudimentary way to ensure certain assets are loaded before starting app
	//==================================
	function loadAssets(){
		_scope = this;
		//console.log("assets", assets);
		
		for ( i=0;i<assets.length;i++) {
			_ref = assets[i];
			
			if(assets[i].type=="image"||"img"){
				var tmpImg  = new Image();
				tmpImg.src = _ref.url;
				
				tmpImg.onload = function(_scope){
					
					assetsLoaded++;
					//console.log("asset loaded", _ref.name, assetsLoaded, " / ", assets.length);
					//all assets loaded?
					if(assetsLoaded == assets.length){
						//console.log("all assets loaded", assetLib);
						start();
					}
				
				};
				assets[i].img = tmpImg;
			}
		}
	}

	//==================================
	// addAsset
	// 
	//==================================
	function addAsset (asset){
		var asset = asset;
		if(asset.name != 'undefined' && asset.url.length>0){
			assets.push(asset);
			//assets[asset.name]=asset; // better to use references in assetLib[]
			totalAssets++;
		}else{
			//console.log("asset info incorrect");
		}
	}

	//==================================
	// addAssets
	// Iterate array of assets
	//==================================
	function addAssets(assets){
		for(i=0;i<assets.length;i++){
			addAsset(assets[i]);
		}
	}

	//==================================
	//
	//==================================
	function createBackgroundsMenu(){
		for(var i = 0; i < assetLib["backgrounds"].length; i++){
			var _scope = this;
			var item = assetLib["backgrounds"][i];
			console.log("listbg", item);
			var bItem = document.createElement("div");
			bItem.dataset.rel = i; //data attribute??
			bItem.dataset.name = item.name;
			bItem.appendChild(item.img);

			uiMenuBackgrounds.appendChild(bItem);

			bItem.onclick = (function(bItem){return function(){
				console.log("menu click", bItem.dataset);
				currentBackground = bItem.dataset.rel;
				draw();
			}})(bItem);


		}
	}

	//==================================
	//
	//==================================


	return {
		"init":init,
		"applyImage":applyImage
	}

})();


uiCollage.init();
