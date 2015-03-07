(function(win) {
  'use strict';
  $('#joystick').hide();

  if(!win.isMobile()) return;

  $('#joystick').show();

  var sendCommand = function(command, angle) {
    console.log(command, angle);
  };

  interact('.draggable')
    .draggable({
      // enable inertial throwing
      inertia: true,
      // keep the element within the area of it's parent
      restrict: {
        // restriction: 'parent',
        restriction: '.elastic-base',
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      },

      // call this function on every dragmove event
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

          // angle in radians
          var angleRadians = Math.atan2(y, x);

          // angle in degrees
          var angleDeg = Math.atan2(y, x) * 180 / Math.PI;

          if(target.hasAttribute('id') && (target.getAttribute('id') === 'navigate' || target.getAttribute('id') === 'fire'))
            sendCommand(target.getAttribute('id'), angleRadians);
        }
      },
      // call this function on every dragend event
      onend: function (event) {
        event.target.style.webkitTransform = event.target.style.transform = 'translate(0px, 0px)';
        event.target.setAttribute('data-x', 0);
        event.target.setAttribute('data-y', 0);

        // angle in radians
        var angleRadians = Math.atan2(0, 0);

        // angle in degrees
        var angleDeg = Math.atan2(0, 0) * 180 / Math.PI;
      }
    });

  //joystick logic
  var socket = io();

  // Variable initialization

  var form = $('form.login');
  var secretTextBox = form.find('input[type=text]');
  var presentation = $('.reveal');

  var key = "", animationTimeout;

  // When the page is loaded it asks you for a key and sends it to the server

  form.submit(function(e){

    e.preventDefault();

    key = secretTextBox.val().trim();

    // If there is a key, send it to the server-side
    // through the socket.io channel with a 'load' event.

    if(key.length) {
      socket.emit('load', {
        key: key
      });
    }

  });

  // The server will either grant or deny access, depending on the secret key

  socket.on('access', function(data){

    // Check if we have "granted" access.
    // If we do, we can continue with the presentation.

    if(data.access === "granted") {

      // Unblur everything
      presentation.removeClass('blurred');

      form.hide();

      var ignore = false;

      $(window).on('hashchange', function(){

        // Notify other clients that we have navigated to a new slide
        // by sending the "slide-changed" message to socket.io

        if(ignore){
          // You will learn more about "ignore" in a bit
          return;
        }

        var hash = window.location.hash;

        socket.emit('slide-changed', {
          hash: hash,
          key: key
        });
      });

      socket.on('navigate', function(data){
  
        // Another device has changed its slide. Change it in this browser, too:

        window.location.hash = data.hash;

        // The "ignore" variable stops the hash change from
        // triggering our hashchange handler above and sending
        // us into a never-ending cycle.

        ignore = true;

        setInterval(function () {
          ignore = false;
        },100);

      });

    }
    else {

      // Wrong secret key

      clearTimeout(animationTimeout);

      // Addding the "animation" class triggers the CSS keyframe
      // animation that shakes the text input.

      secretTextBox.addClass('denied animation');
      
      animationTimeout = setTimeout(function(){
        secretTextBox.removeClass('animation');
      }, 1000);

      form.show();
    }

  });


})(window);
