var game = new Phaser.Game(500, 500, Phaser.AUTO, 'game');

var BELIEVE = function(game) {
	this.game = game;

	this.player = null;
	this.playerEnergy = null;
	this.shield = null;
	this.others = null;

	this.cursors = null;
	this.spwanInterval = null;
}

BELIEVE.prototype = {
	init: function() {
		this.cursors = this.input.keyboard.createCursorKeys();	
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
	}, 

	preload: function() {

	}, 

	create: function() {
		// create background
		this.game.stage.backgroundColor = "#333333";

		// create shield
		this.shield = this.add.sprite(this.game.world.centerX, game.world.centerY);
		this.shield.radius = 100;
		this.game.physics.arcade.enable(this.shield);
		var shieldGraphics = this.game.make.graphics(0, 0);
		shieldGraphics.beginFill(0x888888, 0.3);
		shieldGraphics.drawCircle(0, 0, this.shield.radius * 2);
		shieldGraphics.endFill();
		this.shield.addChild(shieldGraphics);
		this.shield.visible = false;

		// create player
		this.player = this.add.sprite(this.game.world.centerX, game.world.centerY);
		this.player.radius = 20;
		this.game.physics.arcade.enable(this.player);
		var playerGraphics = this.game.add.graphics(0, 0);
		playerGraphics.lineStyle(1, 0x111111, 1);
		playerGraphics.drawCircle(0, 0, this.player.radius * 2);
		this.playerEnergy = this.game.add.graphics(0, 0);
		this.playerEnergy.beginFill(0x111111, 0.2);
		this.playerEnergy.drawCircle(0, 0, this.player.radius * 2);
		this.playerEnergy.endFill();
		this.player.addChild(this.playerEnergy);
		this.player.addChild(playerGraphics);
		this.player.energy = 100;

		// enemies
		this.others = this.game.add.group();
		this.others.enableBody = true;

		this.spawn();
		this.game.time.events.loop(2000, this.spawn, this);
	},

	update: function() {
		// update values
		// check shield state
		if(this.cursors.down.isDown && (this.player.energy > 20 || this.shield.visible && this.player.energy > 0)) {
			this.shield.visible = true;
			this.player.energy -= 3;
		} else {
			this.shield.visible = false;
			this.player.energy++;
		}

		this.playerEnergy.alpha = this.player.energy / 100;

		this.others.forEachAlive(function(other) {
			if(other.position.distance(this.player.position) < other.radius + this.player.radius)
				this.die();
			if(this.shield.visible && other.position.distance(this.shield) < other.radius + this.shield.radius)
				this.harm(other);
		}, this);

		// move enemies

	},

	render: function() {
		// game.debug.spriteBounds(this.shield);
	},

	spawn: function() {
		var other = this.others.create(0,0);
		other.radius = 10;
		var otherGraphics = this.game.add.graphics(0, 0);
		otherGraphics.lineStyle(1, 0x555555, 1);
		otherGraphics.beginFill(0x555555, 0.9);
		otherGraphics.drawCircle(0, 0, other.radius * 2);
		other.addChild(otherGraphics);

		var rad = Math.random() * Math.PI * 2;
		var x = Math.cos(rad) * 250 + this.game.world.centerX;
		var y = Math.sin(rad) * 250 + this.game.world.centerY;
		other.position.x = x;
		other.position.y = y;
		other.body.velocity.x = -Math.cos(rad) * 60;
		other.body.velocity.y = -Math.sin(rad) * 60;
		other.health = 100;
	},

	harm: function(other) {
		other.health -= 4;
		other.alpha = other.health / 100;
		if(other.health < 0) other.kill();
	}, 

	die: function() {
		this.game.paused = true;
		window.clearInterval(this.spawnInterval);
		console.log('YOU ARE DEAD');
	}
}

game.state.add("BELIEVE", BELIEVE, true);