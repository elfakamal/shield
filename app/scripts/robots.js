'use strict';

$(document).ready(function() {

  //only for desktop
  if(window.isMobile()) return;

  var socket = io(),

      game,

      width = $(window).width(),
      height = $(window).height(),

      player,
      playerBodySize = 100,
      playerNavigator,
      playerNavigatorHandler,
      playerRotation = 0,
      playerDefaultSpeed = 200,

      playerGun,
      playerGunWidth = 10,
      playerGunHeight = 20,
      playerGunRotation = 0,

      playerGunPointer,
      playerGunPointerHandler,

      cursors,

      isRemoteFiring = false,
      isRemoteNavigating = false,

      bullets,
      bulletsCount = 200,
      bulletSpeed = 400,
      currentBullet,

      ennemies,
      ennemiesCount = 5,

      bulletTime = 0,
      fireRate = 100,
      nextFire = 0,

      currentGameSession;

  socket.on('begin-fire', function(data) { isRemoteFiring = true; });
  socket.on('end-fire', function(data) { isRemoteFiring = false; });
  socket.on('fire', function(data) { playerGunRotation = data.angle; });

  socket.on('begin-navigate', function(data) { isRemoteNavigating = true; });
  socket.on('end-navigate', function(data) { isRemoteNavigating = false; });
  socket.on('navigate', function(data) { playerRotation = data.angle; });

  var toRadians = function(degrees) { return degrees * Math.PI / 180; },
      toDegrees = function(radians) { return radians * 180 / Math.PI; };



  var initWorld = function() {
    game.stage.backgroundColor = '#ffffff';
  };

  var initListeners = function() {
    game.input.addMoveCallback(function() {
      playerGunRotation = game.physics.arcade.angleToPointer(playerGun);
    }, this);
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
    playerNavigatorHandler = playerNavigator.create(30, -5, 'bullet');
    playerNavigatorHandler.alpha = 0;
  };

  var createGunPointer = function() {
    playerGunPointer = game.add.group();
    playerGunPointerHandler = playerGunPointer.create(30, -5, 'bullet');
    playerGunPointerHandler.alpha = 0;
  };

  var createBullets = function() {
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    bullets.createMultiple(bulletsCount, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
  };

  var createEnnemies = function() {
    ennemies = game.add.group();
    ennemies.enableBody = true;
    ennemies.physicsBodyType = Phaser.Physics.ARCADE;

    ennemies.createMultiple(ennemiesCount, 'ennemy');
    ennemies.setAll('checkWorldBounds', true);
    ennemies.setAll('outOfBoundsKill', true);

    var i = 0;
    ennemies.forEach(function(ennemy) {
      ennemy.anchor.x = 0.5;
      ennemy.anchor.y = 0.5;
      ennemy.reset(i * 1000, i * 1000);
    }, this);
  };

  var handleMovement = function() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.body.angularVelocity = 0;

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
      playerRotation -= 0.08;
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
      playerRotation += 0.08;

    playerNavigator.rotation = playerRotation;
    playerGunPointer.rotation = playerGunRotation;

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP) || isRemoteNavigating)
      game.physics.arcade.velocityFromAngle(player.angle, playerDefaultSpeed, player.body.velocity);

    playerGun.x = player.x;
    playerGun.y = player.y;

    playerNavigator.x = player.x;
    playerNavigator.y = player.y;

    playerGunPointer.x = player.x;
    playerGunPointer.y = player.y;
  };

  var fire = function() {
    if (game.time.now > nextFire && bullets.countDead() > 0) {
      nextFire = game.time.now + fireRate;
      currentBullet = bullets.getFirstDead();
      currentBullet.rotation = playerGunRotation;
      currentBullet.anchor.x = 0.5;
      currentBullet.anchor.y = 0.5;
      currentBullet.reset(player.x, player.y);

      if(game.input.activePointer.isDown)
        game.physics.arcade.moveToPointer(currentBullet, bulletSpeed);
      else
        game.physics.arcade.velocityFromAngle(currentBullet.angle, bulletSpeed, currentBullet.body.velocity);
    }
  };

  var handleGun = function() {
    player.rotation = playerNavigator.rotation;
    playerGun.rotation = playerGunRotation;

    if(game.input.activePointer.isDown || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || isRemoteFiring)
      fire();
  };


  socket.emit('get-current-game-session', populateGameSession);
  socket.emit('get-current-game-session-players', function(players) {
    updatePlayers(players);

    if(Object.keys(players).length > 0) {
      $('.login').hide();
      startGame();
    }
  });


  /**
   * Sends a request to the server ini order to create a game session.
   */
  $('#start-game-button').click(function() {
    socket.emit('add-game-session', populateGameSession);
  });


  /**
   * When a player joins the game, add him to the dictionnary
   */
  socket.on('player-joined-game-session', function(data) {
    $('.login').hide();
    joinPlayer(data.player);
    startGame();
  });

  function joinPlayer(player) {
    var playerAvatar = $('<img src="images/player.png" class="animated jello player" alt="' + player.name + '" class="img-circle">');
    $('#players').append(playerAvatar);
  }

  function updatePlayers(players) {
    for(var name in players) {
      joinPlayer(players[name]);
    }
  }

  /**
   * displays a game session in the html
   */
  function populateGameSession(gameSession) {
    if(!gameSession) {
      $('#start-game-button').show();
      return;
    }

    $('#start-game-button').remove();
    $('#session-details').show();
    $('#session-name').html(gameSession.name);
    $('#session-key').html(gameSession.key);
    $('#session-description').html(gameSession.description);
  }

  /**
   * Creates phaser game.
   */
  function startGame() {
    game = new Phaser.Game(
      width,
      height,
      Phaser.AUTO,
      'shield-game',
      {
        preload: function() {
          game.load.image('dummy-robot', 'images/dummy_robot.png');
          game.load.image('gun', 'images/gun.png');
          game.load.image('bullet', 'images/bullet.png');
          game.load.image('ennemy', 'images/ennemy.png');
        },
        create: function() {
          game.physics.startSystem(Phaser.Physics.ARCADE);
          initWorld();
          initListeners();
          createGun();
          createBullets();
          createNavigator();
          createGunPointer();
          createPlayer();
          createEnnemies();
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
  }
});
