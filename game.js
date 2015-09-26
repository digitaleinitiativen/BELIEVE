var game = new Phaser.Game(500, 500, Phaser.AUTO, 'game');

var BELIEVEStart = function(game) {
	this.game = game;
}

BELIEVEStart.prototype = {
	init: function() {
	},

	preload: function() {
		game.load.bitmapFont('carrier_command', 'assets/carrier_command.png', 'assets/carrier_command.xml');		
	},

	create: function() {
		this.game.stage.backgroundColor = "#333333";

		this.game.add.bitmapText(100, 200, 'carrier_command','START TO BELIEVE!\n\nDON\'T LET THE OTHERS\n\nGET YOU!' ,15);
		this.game.add.bitmapText(100, 350, 'carrier_command','PRESS DOWN TO ACTIVATE THE SHIELD', 8);

		var replay = this.game.add.bitmapText(100, 400, 'carrier_command', 'PLAY', 10);
		replay.inputEnabled = true;
		replay.events.onInputDown.add(this.start, this);
	},
	update: function() {
		if(game.input.keyboard.isDown(Phaser.Keyboard.UP))
			this.start();
	},
	start: function() {
		this.game.state.start('BELIEVE');
	}
}

var BELIEVE = function(game) {
	this.game = game;

	this.player = null;
	this.playerEnergy = null;
	this.shield = null;
	this.shieldBound = null;
	this.shieldBoundActive = null;
	this.shieldSprite = null;
	this.others = null;
	this.scoreboard = null;

	this.cursors = null;
	this.spawnEvent = null;
	this.stopped = false;
	this.score = 0;
	this.respawn = 0;
	this.spawnSpeed = 0;

	this.CONF = {
		STAGE_BACKGROUND: 0x333333,

		RESPAWN: 2000,
		RESPAWN_INC: 50,
		MIN_RESPAWN: 500,
		RESPAWN_RAND: 500,

		SHIELD_RADIUS: 100,
		SHIELD_BACKGROUND: 0x888888,
		SHIELD_BACKGROUND_ALPHA: 0.3,
		SHIELD_LINE_WIDTH: 3,
		SHIELD_LINE_COLOR: 0x888888,
		SHIELD_LINE_ALPHA: 0.5,
		SHIELD_BOUND_ACTIVE_COLOR: 0xff0000,
		SHIELD_BOUND_ACTIVE_ALPHA: 1,

		PLAYER_RADIUS: 20,
		PLAYER_LINE_WIDTH: 2,
		PLAYER_LINE_COLOR: 0x111111,
		PLAYER_LINE_ALPHA: 1,
		PLAYER_FILL_COLOR: 0x111111,
		PLAYER_FILL_ALPHA: 0.8,
		PLAYER_INACTIVE_ALPHA: 0.5,
		PLAYER_ACTIVE_ALPHA: 1,
		PLAYER_HEART_WIDTH: 20,

		SHIELD_START_ENERGY: 90,
		SHIELD_ACTIVE_REDUCE_ENERGY: 2,
		SHIELD_ADD_ENERGY: 1,
		SHIELD_MAX_ENERGY: 100,

		OTHER_RADIUS: 10,
		OTHER_LINE_WIDTH: 2,
		OTHER_LINE_COLOR: 0x000000,
		OTHER_LINE_ALPHA: 1,
		OTHER_FILL_COLOR: 0x000000,
		OTHER_FILL_ALPHA: 0.9,
		OTHER_SPAWN_RADIUS: 250,
		OTHER_SPAWN_SPEED: 60,
		OTHER_SPAWN_SPEED_INC: 2,
		OTHER_SPAWN_SPEED_RAND: 10,
		OTHER_SPAWN_HEALTH: 100,
		OTHER_HARM: 5,
		OTHER_HARM_DELTA: 0.8,

	}
}

BELIEVE.prototype = {
	init: function() {
		this.cursors = this.input.keyboard.createCursorKeys();	
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
	}, 

	preload: function() {
		this.game.load.bitmapFont('carrier_command', 'assets/carrier_command.png', 'assets/carrier_command.xml');
		this.game.load.image('heart', 'assets/heart.png');
	}, 

	create: function() {
		// create background
		this.stopped = false;
		this.game.stage.backgroundColor = this.CONF.STAGE_BACKGROUND;

		// create shield
		this.shieldSprite = this.game.add.sprite(this.game.world.centerX, game.world.centerY);
		this.game.physics.arcade.enable(this.shieldSprite);
		this.shield = this.game.make.graphics(0, 0);
		this.shield.radius = this.CONF.SHIELD_RADIUS;
		this.shield.beginFill(this.CONF.SHIELD_BACKGROUND, this.CONF.SHIELD_BACKGROUND_ALPHA);
		this.shield.drawCircle(0, 0, this.shield.radius * 2);
		this.shield.endFill();
		this.shieldSprite.addChild(this.shield);
		this.shieldBound = this.game.make.graphics(0, 0);
		this.shieldBound.lineStyle(this.CONF.SHIELD_LINE_WIDTH, this.CONF.SHIELD_LINE_COLOR, this.CONF.SHIELD_LINE_ALPHA);
		this.shieldBound.drawCircle(0, 0, this.shield.radius * 2);
		this.shieldSprite.addChild(this.shieldBound);
		this.shieldBoundActive = this.game.make.graphics(0, 0);
		this.shieldBoundActive.lineStyle(this.CONF.SHIELD_LINE_WIDTH, this.CONF.SHIELD_BOUND_ACTIVE_COLOR, this.CONF.SHIELD_BOUND_ACTIVE_ALPHA);
		this.shieldBoundActive.drawCircle(0, 0, this.shield.radius * 2);
		this.shieldSprite.addChild(this.shieldBoundActive);
		this.shieldBoundActive.visible = false;
		this.shield.visible = false;

		// create player
		this.player = this.add.sprite(this.game.world.centerX, game.world.centerY);
		this.player.radius = this.CONF.PLAYER_RADIUS;
		this.game.physics.arcade.enable(this.player);
		var playerGraphics = this.game.add.graphics(0, 0);
		playerGraphics.lineStyle(this.CONF.PLAYER_LINE_WIDTH, this.CONF.PLAYER_LINE_COLOR, this.CONF.PLAYER_LINE_ALPHA);
		playerGraphics.drawCircle(0, 0, this.player.radius * 2);
		this.playerEnergy = this.game.add.graphics(0, 0);
		this.playerEnergy.beginFill(this.CONF.PLAYER_FILL_COLOR, this.CONF.PLAYER_FILL_ALPHA);
		this.playerEnergy.drawCircle(0, 0, this.player.radius * 2);
		this.playerEnergy.endFill();
		var heart = this.game.add.sprite(0, 0, 'heart');
		heart.width = this.CONF.PLAYER_HEART_WIDTH;
		heart.height = this.CONF.PLAYER_HEART_WIDTH;
		heart.x = -heart.width / 2;
		heart.y = -heart.height / 2;
		this.player.addChild(this.playerEnergy);
		this.player.addChild(playerGraphics);
		this.player.addChild(heart);
		this.player.energy = 0;

		// enemies
		this.others = this.game.add.group();
		this.others.enableBody = true;

		this.spawnSpeed = this.CONF.OTHER_SPAWN_SPEED;
		this.respawn = this.CONF.RESPAWN;
		this.spawn();

		var restart = this.game.add.bitmapText(this.game.world.width - 55, 5, 'carrier_command', 'restart', 6);
		restart.inputEnabled = true;
		restart.events.onInputDown.add(this.reset, this);

		this.scoreboard = this.game.add.bitmapText(5, 5, 'carrier_command', '0', 6);
		this.updateScoreBoard();
	},

	update: function() {
		if(this.stopped) {
			if(game.input.keyboard.isDown(Phaser.Keyboard.UP))
				this.reset();
			return;	
		} 
		// update values
		// check shield state
		if(this.cursors.down.isDown && (this.player.energy > this.CONF.SHIELD_START_ENERGY || this.shield.visible && this.player.energy > 0)) {
			this.shield.visible = true;
			this.player.energy -= this.CONF.SHIELD_ACTIVE_REDUCE_ENERGY;
		} else {
			this.shield.visible = false;
			this.player.energy = Math.min(this.player.energy + this.CONF.SHIELD_ADD_ENERGY, this.CONF.SHIELD_MAX_ENERGY);
			if(this.player.energy < this.CONF.SHIELD_START_ENERGY)
				this.shieldBoundActive.visible = false; //this.player.alpha = this.CONF.PLAYER_INACTIVE_ALPHA;
			else
				this.shieldBoundActive.visible = true; //this.player.alpha = this.CONF.PLAYER_ACTIVE_ALPHA;
		}

		// this.playerEnergy.scale.y = this.playerEnergy.scale.x = this.playerEnergy.alpha = this.player.energy / this.CONF.SHIELD_MAX_ENERGY;
		this.shieldBound.alpha = this.shieldBoundActive.alpha = this.player.energy / this.CONF.SHIELD_MAX_ENERGY;

		this.others.forEachAlive(function(other) {
			if(other.position.distance(this.player.position) < other.radius + this.player.radius)
				this.die();
			if(this.shield.visible && other.position.distance(this.shieldSprite) < other.radius + this.shield.radius)
				this.harm(other);
		}, this);

		// move enemies

	},

	render: function() {
		// game.debug.spriteBounds(this.shield);
	},

	spawn: function() {
		var other = this.others.create(0,0);
		other.radius = this.CONF.OTHER_RADIUS;
		var otherGraphics = this.game.add.graphics(0, 0);
		otherGraphics.lineStyle(this.CONF.OTHER_LINE_WIDTH, this.CONF.OTHER_LINE_COLOR, this.CONF.OTHER_LINE_ALPHA);
		otherGraphics.beginFill(this.CONF.OTHER_FILL_COLOR, this.CONF.OTHER_FILL_ALPHA);
		otherGraphics.drawCircle(0, 0, other.radius * 2);
		other.addChild(otherGraphics);

		var rad = Math.random() * Math.PI * 2;
		var x = Math.cos(rad) * this.CONF.OTHER_SPAWN_RADIUS + this.game.world.centerX;
		var y = Math.sin(rad) * this.CONF.OTHER_SPAWN_RADIUS + this.game.world.centerY;
		other.position.x = x;
		other.position.y = y;
		var spawnSpeed = this.spawnSpeed + this.CONF.OTHER_SPAWN_SPEED_RAND * Math.random();
		other.body.velocity.x = -Math.cos(rad) * spawnSpeed;
		other.body.velocity.y = -Math.sin(rad) * spawnSpeed;
		other.health = this.CONF.OTHER_SPAWN_HEALTH;
		this.spawnEvent = this.game.time.events.add(this.respawn + Math.random() * this.CONF.RESPAWN_RAND, this.spawn, this);
		this.respawn = Math.max(this.respawn - this.CONF.RESPAWN_INC, this.CONF.MIN_RESPAWN);
		this.spawnSpeed += this.CONF.OTHER_SPAWN_SPEED_INC;
	},

	harm: function(other) {
		var amount = this.CONF.OTHER_HARM;
		other.health -= amount;
		other.alpha = other.health / this.CONF.OTHER_SPAWN_HEALTH * this.CONF.OTHER_HARM_DELTA + (1 - this.CONF.OTHER_HARM_DELTA);

		if(other.health < 0) other.kill();
		this.score += amount;
		this.updateScoreBoard();
	}, 

	updateScoreBoard: function() {
		var score = this.score + "";
		while(score.length < 10) score = "0" + score;
		this.scoreboard.text = score;
	},

	die: function() {
		
		this.others.forEachAlive(function(other) {
			other.body.velocity.x = 0;
			other.body.velocity.y = 0;
		}, this);
		this.stopped = true;

		this.game.add.bitmapText(100, 200, 'carrier_command','THE OTHERS\n\nGOT YOU!\n\nBELIEVE!\n\nYOUR SCORE ' + this.score, 20);
		this.game.time.events.remove(this.spawnEvent);
		var replay = this.game.add.bitmapText(100, 400, 'carrier_command', 'PLAY AGAIN!\n\n(because you want to)', 10);
		replay.inputEnabled = true;
		replay.events.onInputDown.add(this.reset, this);
	},

	reset: function() {
		this.game.state.start('BELIEVE')
	}
}

game.state.add("BELIEVE", BELIEVE, true);
game.state.add("BELIEVEStart", BELIEVEStart, true);
