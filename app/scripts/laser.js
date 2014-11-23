'use strict';

(function(win) {
  var Laser = function(options) {
    this.defaults = {
      velocity: 10
    };
  };

  Laser.prototype = new EventDispatcher();

  Laser.prototype.fire = function() {

  };
})(window);
