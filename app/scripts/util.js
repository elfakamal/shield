'use strict';

(function(win) {
  win.BotConsole = {
    log: function(object) {
      document.getElementById('console').innerHTML = '<pre>' + JSON.stringify(object) + '</pre>';
    }
  };
})(window);
