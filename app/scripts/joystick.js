(function(win) {
  'use strict';

  if(!win.isMobile()) return;

  var sendCommand = function(command, angle) {
    socket.emit(command, {command: command, angle: angle, key: 'robots'});
  };

  var initJoystick = function() {
    $('#joystick').show();
    $('#joystick article:not(.pair-joystick)').show();

    interact('.draggable')
      .draggable({
        inertia: true,
        restrict: {
          restriction: 'parent',
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        onmove: function (event) {
          if(!event.target.hasAttribute('data-move-disabled')) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);

            var angleRadians = Math.atan2(y, x);
            var angleDeg = Math.atan2(y, x) * 180 / Math.PI;

            if(target.hasAttribute('id') && (target.getAttribute('id') === 'navigate' || target.getAttribute('id') === 'fire'))
              sendCommand(target.getAttribute('id'), angleRadians);
          }
        },
        onend: function (event) {
          event.target.style.webkitTransform = event.target.style.transform = 'translate(0px, 0px)';
          event.target.setAttribute('data-x', 0);
          event.target.setAttribute('data-y', 0);
        }
      });

    document.getElementById('fire').addEventListener('touchstart', function() {
      sendCommand('begin-fire');
    });
    document.getElementById('fire').addEventListener('touchend', function() {
      sendCommand('end-fire');
    });

    document.getElementById('navigate').addEventListener('touchstart', function() {
      sendCommand('begin-navigate');
    });
    document.getElementById('navigate').addEventListener('touchend', function() {
      sendCommand('end-navigate');
    });
  };

  if(win.io !== null && typeof win.io === 'function') {
    //joystick logic
    var socket = io(),
        form = $('#joystick .form'),
        playerNameTextBox = $('#player-name-input'),
        sessionKeyTextBox = $('#session-key-input');

    $('#join').on('click', function(event) {
      var key = sessionKeyTextBox.first().val().trim(),
          name = playerNameTextBox.first().val().trim();

      socket.emit('join-game-session', {
        sessionKey: key,
        player: { name: name }
      });
    });

    $('.pair-joystick').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
      $(this).removeClass('shake');
    });

    socket.on('join-game-session-error', function(data) {
      $('.pair-joystick').addClass('animated shake');
      console.log(data);
    });

    socket.on('player-joined-game-session', function(data) {
      form.hide();
      initJoystick();
    });

    // The server will either grant or deny access, depending on the secret key
    socket.on('access', function(data) {
      if(data.access === 'granted') {
        form.hide();
        initJoystick();
      } else {
        sessionKeyTextBox.first().addClass('denied');
        form.show();
      }
    });
  }

})(window);
