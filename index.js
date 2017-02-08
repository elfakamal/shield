// This is the server-side file of our mobile remote controller app.
// It initializes socket.io and a new express instance.
// Start it by running 'node app.js' from your terminal.

// Creating an express server
var express = require('express'),
    path = require('path'),
    faker = require('faker'),
    consolidate = require('consolidate'),
    app = express(),
    // gameSeesions = {};
    currentGameSession,
    players = {},
    socket;

// This is needed if the app is run on heroku and other cloud providers:
var port = process.env.PORT || 8080;

// Initialize a new socket.io object. It is bound to
// the express app, which allows them to coexist.
var io = require('socket.io').listen(app.listen(port));

// App Configuration
// app.engine('html', consolidate.underscore);
// app.set('views', path.join(__dirname, 'app/views'));
// app.set('view engine', 'html');

// Make the files in the public folder available to the world
app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static('./bower_components'));

// var router = express.Router();
// var i = 0;
//
// /* GET users listing. */
// var robotsRoute = router.get('/robots', function(req, res) {
//   console.log(++i, 'robots requested');
//   res.render(__dirname + '/app/robots.html', {gameSession: currentGameSession});
// });
//
// app.use(robotsRoute);

// This is a secret key that prevents others from opening your presentation
// and controlling it. Change it to something that only you know.
// TODO: remove the robots key, it gonna be dynamically generated
var secret = 'robots';

// Initialize a new socket.io application
var game = io.on('connection', function (socketIO) {
  socket = socketIO;

  // A new client has come online. Check the secret key and
  // emit a 'granted' or 'denied' message.
  socket.on('load', function(data) {
    socket.emit('access', { access: (data.key === secret ? 'granted' : 'denied') });
  });

  /**
   * listen on game session generation event
   */
  socket.on('add-game-session', function(socketCallback) {
    var gameSession;

    do {
      gameSession = {
        name: faker.hacker.ingverb() + ' ' + faker.hacker.adjective() + ' ' + faker.hacker.noun(),
        key: faker.company.bsBuzz(),
        description: faker.hacker.phrase(),
      };
    } while (typeof currentGameSession !== 'undefined' && gameSession.key === currentGameSession.key);
    // } while (typeof gameSeesions[gameSession.key] !== 'undefined');

    // gameSeesions[gameSession.key] = gameSession;
    currentGameSession = gameSession;

    console.log('');
    console.log('::');
    console.log('game session added:', gameSession.name, '| key:', gameSession.key);
    socketCallback(gameSession);
  });

  /**
   *
   * When the player wants to join a game
   *
   */
  socket.on('join-game-session', function(data) {
    console.log('join request received', data);
    var errors = {};

    if(typeof currentGameSession === 'undefined') {
      errors.key = 'no current session available';
    } else if (currentGameSession.key !== data.sessionKey) {
      errors.key = 'invalid game session key';
    }

    if(typeof players[data.player.name] !== 'undefined') {
      errors.name = 'already existing player';
    }

    if(Object.keys(errors).length === 0) {
      //saving the player
      players[data.player.name] = data.player;

      console.log('player-joined-game-session sent');
      io.sockets.emit('player-joined-game-session', data);
    } else {
      data.errors = errors;
      console.log('join-game-session-error sent', errors);
      socket.emit('join-game-session-error', data);
    }
  });

  socket.on('get-current-game-session', function(socketCallback) {
    socketCallback(currentGameSession);
  });

  socket.on('get-current-game-session-players', function(socketCallback) {
    socketCallback(players);
  });

  var eventHandler =  function (event) {
    return function(data) {
      if(data.key !== secret) return;
      game.emit(event, data);
    };
  };

  var events = ['fire-one', 'begin-fire', 'end-fire', 'begin-navigate', 'end-navigate', 'fire', 'navigate'];
  for (var i = events.length - 1; i >= 0; i--)
    socket.on(events[i], eventHandler(events[i]));
});

console.log('Your game is running on http://localhost:' + port);
