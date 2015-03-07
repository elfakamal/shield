'use strict';

$(document).ready(function() {

  var width = $(window).width(),
      height = $(window).height(),

      player,
      playerNavigator,
      playerNavigatorHandler,

      playerGun,
      playerGunWidth = 10,
      playerGunHeight = 20,
      playerBodySize = 100,
      playerDefaultSpeed = 200,

      cursors,

      bullets,
      bulletSpeed = 400,
      currentBullet,

      bulletTime = 0,
      fireRate = 100,
      nextFire = 0;

  // Converts from degrees to radians.
  var toRadians = function(degrees) {
    return degrees * Math.PI / 180;
  };

  // Converts from radians to degrees.
  var toDegrees = function(radians) {
    return radians * 180 / Math.PI;
  };

  var initWorld = function() {
    game.stage.backgroundColor = '#ffffff';
  };

  var createPlayer = function() {
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'dummy-robot');
    player.anchor.setTo(0.5, 0.5);
    player.scale.x = 0.6;
    player.scale.y = 0.6;

    game.physics.enable(player, Phaser.Physics.ARCADE);
  };

  var createGun = function() {
    playerGun = game.add.sprite(game.world.centerX, game.world.centerY, 'gun');
    playerGun.anchor.setTo(0.5, 0.5);
    playerGun.scale.x = 0.4;
    playerGun.scale.y = 0.4;
  };

  var createNavigator = function() {
    playerNavigator = game.add.group();
    playerNavigatorHandler = playerNavigator.create(30, 0, 'bullet');
    playerNavigatorHandler.alpha = 0.2;
  };

  var createBullets = function() {
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(500, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
  };

  var handleMovement = function() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.angularVelocity = 0;

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
      playerNavigator.rotation -= 0.08;
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
      playerNavigator.rotation += 0.08;

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
      game.physics.arcade.velocityFromAngle(player.angle, playerDefaultSpeed, player.body.velocity);

    playerGun.x = player.x;
    playerGun.y = player.y;

    playerNavigator.x = player.x;
    playerNavigator.y = player.y;
  };

  var fire = function() {
    if (game.time.now > nextFire && bullets.countDead() > 0) {
      nextFire = game.time.now + fireRate;
      currentBullet = bullets.getFirstDead();
      currentBullet.reset(player.x - 5, player.y - 5);
      game.physics.arcade.moveToPointer(currentBullet, bulletSpeed);
    }
  };

  var handleGun = function() {
    player.rotation = playerNavigator.rotation;
    playerGun.rotation = game.physics.arcade.angleToPointer(player);

    if(game.input.activePointer.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
      fire();
  };

  var game = new Phaser.Game(
    width,
    height,
    Phaser.AUTO,
    'phaser-example',
    {
      preload: function() {
        game.load.image('dummy-robot', 'images/dummy_robot.png');
        game.load.image('gun', 'images/gun.png');
        game.load.image('bullet', 'images/bullet.png');
      },
      create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        initWorld();
        createPlayer();
        createGun();
        createBullets();
        createNavigator();
        cursors = game.input.keyboard.createCursorKeys();
      },
      update: function() {
        handleMovement();
        handleGun();
      },
      render: function() {
        game.debug.geom(player, '#9ACD32');
      }
    }
  );
});
