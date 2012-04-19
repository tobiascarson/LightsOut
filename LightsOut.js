//port from http://gdreflections.com/2011/02/hexagonal-grid-math.html
//to javascript/canvas

var LightsOut = function(canvas){
	var self = this;

	//CONSTANTS
	var ON 				= 1;
	var OFF				= 0;
	var NUM_HEX_CORNERS		= 6;
	
	//DEFAULTS
	var board			= [
					  [ -1, ON, ON, ON, -1 ], 
					  [ ON, ON, ON, ON, ON ], 
					  [ ON, ON, ON, ON, ON ],
					  [ -1, -1, ON, -1, -1 ] 
					  ];	
	var onColor			= "lightGreen";
	var offColor			= "whiteSmoke";
	var lineColor			= "black";
	var cellRadius			= 50;

	var boardHeight			= board.length;
	var boardWidth			= board[0].length;

	//start graphics a little below the top of the canvas
	var graphics = canvas.getContext("2d");
	graphics.translate(0,10);

	var Cell = function(radius){
		var self = this;
		var NEIGHBORS_DI = [ 0, 1, 1, 0, -1, -1 ];
		var NEIGHBORS_DJ = [ 
		                   [ -1, -1,  0,  1,  0, -1 ], 
		                   [ -1,  0,  1,  1,  1,  0 ] 
		                   ];
		var NUM_NEIGHBORS = 6;

		var mX = 0; // cell's left coordinate
		var mY = 0; // cell's top coordinate
		var mI = 0; // cell's horizontal grid coordinate
		var mJ = 0; // cell's vertical grid coordinate

		var height = radius * Math.sqrt(3);
		var width = radius * 2;
		var side = radius * 3 / 2;

		var CORNERS_DX = [radius / 2, side, width, side, radius / 2, 0]; // array of horizontal offsets of the cell's corners
		var CORNERS_DY = [ 0, 0, height / 2, height, height, height / 2 ]; // array of vertical offsets of the cell's corners

		// getters
		this.getLeft 		= function(){	return mX; };
		this.getTop 		= function(){	return mY; };
		this.getCenterX 	= function(){ 	return mX + radius; };
		this.getCenterY 	= function(){ 	return mY + height / 2; };
		this.getIndexI 		= function(){ 	return mI; };
		this.getIndexJ 		= function(){ 	return mJ; };
		this.getNeighborI	= function(neighborIdx) { return mI + NEIGHBORS_DI[neighborIdx];};
		this.getNeighborJ	= function(neighborIdx) { return mJ + NEIGHBORS_DJ[mI % 2][neighborIdx]; };


		this.computeCorners	= function(){
						var cornersX = [];
						var cornersY = [];
						for (var k = 0; k < NUM_NEIGHBORS; k++) {
							cornersX[k] = mX + CORNERS_DX[k];
							cornersY[k] = mY + CORNERS_DY[k];
						}
						return { x:cornersX, y:cornersY };
					};
		this.setCellIndex	= function(i, j) {
						mI = i;
						mJ = j;
						mX = i * side;
						mY = height * (2 * j + (i % 2)) / 2;
					};
	
	
		// Sets the cell as corresponding to some point inside it (can be used for e.g. mouse picking).
		this.setCellByPoint	= function(x, y) {
						var ci = Math.floor(x/side);
						var cx = x - side*ci;

						var ty = y - (ci % 2) * height / 2;
						var cj = Math.floor(ty/ height);
						var cy = ty - height*cj;

						if (cx > Math.abs(radius / 2 - radius * cy / height)) {
							self.setCellIndex(ci, cj);
						} else {
							self.setCellIndex(ci - 1, cj + (ci % 2) - ((cy < height / 2) ? 1 : 0));
						}
					};
	};

	var mCellMetrics = new Cell(cellRadius);
	
	this.paintBoard = function() {
		for (var j = 0; j < boardHeight; j++) {
			for (var i = 0; i < boardWidth; i++) {
				mCellMetrics.setCellIndex(i, j);
				if (board[j][i] != -1) {
					var corners = mCellMetrics.computeCorners();
					graphics.lineWidth = 2;
					graphics.strokeStyle = lineColor;
					graphics.beginPath();
					graphics.fillStyle = ((board[j][i] === ON) ? onColor : offColor);
					graphics.moveTo(corners.x[0], corners.y[0]);
					for (var n = 1; n < NUM_HEX_CORNERS; n++) {
						graphics.lineTo(corners.x[n], corners.y[n]);
					}
					graphics.closePath();
					graphics.fill();
					graphics.stroke();
				}
			}
		}
	};

	//Returns true if the cell is inside the game board.
	this.isInsideBoard = function(i, j) {
		return	i >= 0 && i < boardWidth && 
				j >= 0 && j < boardHeight && 
				board[j][i] != -1;
	};
	
	//Toggles the cell's light ON<->OFF.
	this.toggleCell = function(i, j) {
		board[j][i] = (board[j][i] === ON) ? OFF : ON;
	};

	//Returns true if all lights have been switched off.
	this.isWinCondition = function() {
		for (var j = 0; j < boardHeight; j++) {
			for (var i = 0; i < boardWidth; i++) {
				if (board[j][i] === ON) {
					return false;
				}
			}
		}
		return true;
	};

	//Resets the game to the initial position (all lights are on).
	this.resetGame = function() {
		for (var j = 0; j < boardHeight; j++) {
			for (var i = 0; i < boardWidth; i++) {
				if (board[j][i] == OFF) {
					board[j][i] = ON;
				}
			}
		}
	};
	
	canvas.onmouseup = function(event) {
		mCellMetrics.setCellByPoint(event.offsetX, event.offsetY);
		var clickI = mCellMetrics.getIndexI();
		var clickJ = mCellMetrics.getIndexJ();

		if (self.isInsideBoard(clickI, clickJ)) {
			// toggle the clicked cell together with the neighbors
			self.toggleCell(clickI, clickJ);
			for (var k = 0; k < NUM_HEX_CORNERS; k++) {
				var nI = mCellMetrics.getNeighborI(k);
				var nJ = mCellMetrics.getNeighborJ(k);
				if (self.isInsideBoard(nI, nJ)) {
					self.toggleCell(nI, nJ);
				}
			}
		}
		self.paintBoard();

		if (self.isWinCondition()) {
			alert("Well Done!");
			self.resetGame();
			self.paintBoard();
		}
		
	};
	
	this.paintBoard();
};
