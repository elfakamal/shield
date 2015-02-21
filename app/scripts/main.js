'use strict';

(function(win) {
  var defaults = {
        color: 0x000000,
        width: 800,
        height: 600,
        // arcColor: 0x6fd4fe,
        arcColor: 0xFFFFFF,
        arcAlpha: 0.2,
        strokeWidth: 5,
        minArcAngle: Math.PI / 2,
        minRadius: 10,
        maxRadius: 50,
        gunRotation: 0.05
      },

      myDisplayResolution = win.devicePixelRatio,
      
      renderOptions = {
        antialiasing: true,
        transparent: false,
        resolution: myDisplayResolution
      };

      var stage = new PIXI.Stage(defaults.color),
      renderer = PIXI.autoDetectRenderer(defaults.width, defaults.height, renderOptions),
      //renderer = PIXI.CanvasRenderer(defaults.width, defaults.height, renderOptions),
      velocityX = 5,
      velocityY = 5,
      directionProcessed = false,
      laserLaunched = false,
      i = 0,
      j = 0,

      //gun
      gunSprite,
      bullets,
      gunRotation = defaults.gunRotation,
      gunRotating = false,
      gunFiring = false,

      //fire bullets
      maxFire = 100,
      fireRate = 24000 / maxFire,
      nowTime,
      nextFireTime = 0,
      currentlyFiredBullet,

      arcs = [];

  // add the renderer view element to the DOM
  document.getElementById('shield').appendChild(renderer.view);

  document.addEventListener('keydown', function(event) {
    if (event.keyCode === 37 || event.keyCode === 39)
      gunRotating = true;

    if (event.keyCode === 37)
      gunRotation = -1 * Math.abs(gunRotation);
    else if (event.keyCode === 39)
      gunRotation = Math.abs(gunRotation);

    if(event.keyCode === 32)
      gunFiring = true;
  });

  document.addEventListener('keyup', function(event) {
    if (event.keyCode === 37 || event.keyCode === 39)
      gunRotating = false;

    if(event.keyCode === 32)
      gunFiring = false;
  });


  /**
   *
   *
   */
  var createGun = function() {
    var texture = PIXI.Texture.fromImage('images/gun.png');
    gunSprite = new PIXI.Sprite(texture);

    gunSprite.x = defaults.width / 2;
    gunSprite.y = defaults.height / 2;
    gunSprite.anchor.x = 0.5;
    gunSprite.anchor.y = 0.5;

    stage.addChild(gunSprite);
  };


  /**
   *
   *
   */
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


  /**
   *
   *
   */
  var createRandomArc = function() {
    var startAngle = Math.random() * Math.PI,
        //endAngle = startAngle + defaults.minArcAngle + Math.random() * Math.PI,
        endAngle = Math.random() * Math.PI,
        radius = defaults.minRadius + Math.random() * (defaults.maxRadius - defaults.minRadius);

    return createArc(radius, startAngle, endAngle);
  };


  /**
   *
   *
   */
  var createBullets = function() {
    bullets = new PIXI.SpriteBatch();

    bullets.x = defaults.width / 2;
    bullets.y = defaults.height / 2;

    var i = maxFire,
        bullet,
        texture = PIXI.Texture.fromImage('images/arrow.png');

    while(i--) {
      bullet = new PIXI.Sprite(texture);
      bullets.addChild(bullet);

      bullet.scale.x = 0.3;
      bullet.scale.y = 0.3;

      bullet.anchor.x = 0.5;
      bullet.anchor.y = 0.5;

      bullet.blendMode = PIXI.blendModes.ADD;

      bullet.visible = false;
    }

    stage.addChild(bullets);
  };

  var fire = function() {
    nowTime = (new Date()).getTime();

    if( nowTime > nextFireTime ) {
      nextFireTime = nowTime + fireRate;
      currentlyFiredBullet = bullets.getChildAt(bullets.children.length - 1);

      currentlyFiredBullet.visible = true;
    }
  };

  requestAnimFrame(animate);
  createGun();
  createBullets();


  /**
   *
   *
   */
  for(; i < 10 + Math.random() * 30; i++)
    arcs.push(createRandomArc());

  createArc(defaults.maxRadius + 0, 0, 2 * Math.PI, null, 0xFFFFFF, .1);


  /**
   *
   *
   */
  function animate() {
    requestAnimFrame(animate);
    renderer.render(stage);

    for(j = 0; j < arcs.length; j++)
      arcs[j].rotation += Math.random() / 50 * (j%2?1:(-1));

    if(gunRotating) {
      gunSprite.rotation += gunRotation;
      bullets.rotation = gunSprite.rotation;
    }

    if(gunFiring)
      fire();
  }
})(window);
