(function(win) {
  'use strict';

  $('#joystick').hide();

  var sendCommand = function(command, angle) {
    socket.emit(command, {command: command, angle: angle, key: 'robots'});
  };

  var initJoystick = function() {
    if(!win.isMobile()) return;
    $('#joystick').show();

    interact('.draggable')
      .draggable({
        inertia: true,
        restrict: {
          restriction: 'parent',
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        // onstart: function(event) {
        //   if(event.target.getAttribute('id') === 'navigate')
        //     sendCommand('begin-navigate');
        //   else if(event.target.getAttribute('id') === 'fire')
        //     sendCommand('begin-fire');
        // },
        onmove: function (event) {
          if(!event.target.hasAttribute('data-move-disabled')) {
            var target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translate the element
            target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
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

          // if(event.target.getAttribute('id') === 'navigate')
          //   sendCommand('end-navigate');
          // else if(event.target.getAttribute('id') === 'fire')
          //   sendCommand('end-fire');
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

  //joystick logic
  var socket = io(),
      form = $('form.login'),
      secretTextBox = form.find('input[type=text]'),
      key = '', animationTimeout;

  // When the page is loaded it asks you for a key and sends it to the server
  form.submit(function(e) {
    e.preventDefault();
    key = secretTextBox.val().trim();

    if(key.length)
      socket.emit('load', { key: key });
  });

  // The server will either grant or deny access, depending on the secret key
  socket.on('access', function(data){
    if(data.access === 'granted') {
      form.hide();
      initJoystick();
    }
    else
    {
      clearTimeout(animationTimeout);
      secretTextBox.addClass('denied animation');
      animationTimeout = setTimeout(function() { secretTextBox.removeClass('animation'); }, 1000);
      form.show();
    }
  });

})(window);
