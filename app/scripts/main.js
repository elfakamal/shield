'use strict';

(function(win) {
  var defaults = {
        color: 0x222222,
        width: 800,
        height: 600,
        arcColor: 0xFFFFFF,
        arcAlpha: 0.5,
        strokeWidth: 5,
        minArcAngle: Math.PI / 2,
        minRadius: 20,
        maxRadius: 50
      },

      myDisplayResolution = win.devicePixelRatio,
      
      renderOptions = {
        antialiasing: true,
        transparent: false,
        resolution: myDisplayResolution
      },

      stage = new PIXI.Stage(defaults.color),
      renderer = PIXI.autoDetectRenderer(defaults.width, defaults.height, renderOptions),
      velocityX = 5,
      velocityY = 5,
      directionProcessed = false,
      laserLaunched = false,
      i = 0,
      j = 0,

      arcs = [];

  // add the renderer view element to the DOM
  document.getElementById('shield').appendChild(renderer.view);

  var createArc = function(radius, startAngle, endAngle, lineWidth, color, alpha) {
    var graphic = new PIXI.Graphics(),
        strokeWidth = lineWidth || defaults.strokeWidth,
        arcColor = color || defaults.arcColor,
        arcAlpha = alpha || defaults.arcAlpha;

    graphic.drawPolygon();
    graphic.lineStyle(strokeWidth, arcColor, arcAlpha);
    graphic.arc(0, 0, radius, startAngle, endAngle, 0);
    graphic.x = defaults.width / 2;
    graphic.y = defaults.height / 2;
    stage.addChild(graphic);
    return graphic;
  };

  var createRandomArc = function() {
    var startAngle = Math.random() * Math.PI,
        //endAngle = startAngle + defaults.minArcAngle + Math.random() * Math.PI,
        endAngle = Math.random() * Math.PI,
        radius = defaults.minRadius + Math.random() * (defaults.maxRadius - defaults.minRadius);

    return createArc(radius, startAngle, endAngle);
  };

  requestAnimFrame(animate);

  for(; i < 10 + Math.random() * 50; i++)
    arcs.push(createRandomArc());

  createArc(defaults.maxRadius + 10, 0, 2 * Math.PI, null, 0xFFFFFF, .1);

  function animate() {
    requestAnimFrame(animate);
    renderer.render(stage);

    for(j = 0; j < arcs.length; j++)
      arcs[j].rotation += Math.random() / 50 * (j%2?1:(-1));
  }
})(window);
