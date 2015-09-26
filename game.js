var game = new Phaser.Game(500, 500, Phaser.AUTO, 'game');

var BELIEVE = function(game) {
	this.game = game;

	this.player = null;
	this.shield = null;
	this.others = null;

	this.cursors = null;
}

BELIEVE.prototype = {
	init: function() {
		this.cursors = this.input.keyboard.createCursorKeys();	
	}, 

	preload: function() {

	}, 

	create: function() {
		// create background
		this.game.stage.backgroundColor = "#333333";

		// create others


		// create player
		this.player = this.add.sprite(this.game.world.centerX, game.world.centerY);
		var playerGraphics = game.make.graphics(0, 0);
		playerGraphics.lineStyle(1, 0x111111, 1);
		playerGraphics.beginFill(0x111111, 0.5);
		playerGraphics.drawCircle(0, 0, 50);
		this.player.addChild(playerGraphics);

		// create shield

		this.shield = this.add.sprite(this.game.world.centerX, game.world.centerY);
		var shieldGraphics = this.game.make.graphics(0, 0);
		shieldGraphics.lineStyle(1, 0x666666, 1);
		shieldGraphics.beginFill(0x666666, 0.5);
		shieldGraphics.drawCircle(0, 0, 150);
		this.shield.addChild(shieldGraphics);
		this.shield.visible = false;



		// enemies
		this.others = this.game.add.group();

		this.spawn();
	},

	update: function() {
		// update values

		// check shield state
		if(this.cursors.down.isDown) {
			this.shield.visible = true;
		} else {
			this.shield.visible = false;
		}

		// move enemies

	},

	spawn: function() {
		var other = this.game.make.sprite();
		this.others.add(other);
	},

	die: function() {

	}
}

game.state.add("BELIEVE", BELIEVE, true);