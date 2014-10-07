(function() {
  var canvas, ctx, localPoints, paintingOn;

  canvas = document.getElementsByClassName("canvas")[0];

  ctx = canvas.getContext("2d");

  paintingOn = false;

  canvas.height = screen.height;

  canvas.width = screen.width;

  localPoints = [];

  window.onmove = function(e) {
    if (paintingOn) {
      e.preventDefault();
      localPoints.push({
        x: e.pageX,
        y: e.pageY
      });
      ctx.lineTo(e.pageX, e.pageY);
      return ctx.stroke();
    }
  };

  window.onstart = function(e) {
    paintingOn = true;
    return ctx.moveTo(e.pageX, e.pageY);
  };

  window.onend = function(e) {
    c.broadcast(localPoints);
    localPoints = [];
    return paintingOn = false;
  };

  window.drawRemote = function(points) {
    var point, _i, _len, _results;
    ctx.moveTo(points[0].x, points[0].y);
    _results = [];
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      ctx.lineTo(point.x, point.y);
      _results.push(ctx.stroke());
    }
    return _results;
  };

  canvas.addEventListener('touchstart', onstart, false);

  canvas.addEventListener('mousedown', onstart, false);

  canvas.addEventListener('touchmove', onmove, false);

  canvas.addEventListener('mousemove', onmove, false);

  canvas.addEventListener('touchend', onend, false);

  canvas.addEventListener('mouseup', onend, false);

}).call(this);
