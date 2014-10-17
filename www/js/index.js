window.initDraw = function() {
  var localPoints, paintingOn, w;
  window.canvas = document.getElementsByClassName("canvas")[0];
  canvas.classList.remove('hidden');
  window.ctx = canvas.getContext("2d");
  paintingOn = false;
  window.h = canvas.height = screen.height - 200;
  w = canvas.width = screen.width;
  localPoints = [];
  window.onmove = function(e) {
    e.preventDefault();
    if (paintingOn) {
      localPoints.push({
        x: e.pageX,
        y: e.pageY
      });
      ctx.lineWidth = 2;
      ctx.lineTo(e.pageX, e.pageY);
      return ctx.stroke();
    }
  };
  window.onstart = function(e) {
    e.preventDefault();
    ctx.beginPath();
    paintingOn = true;
    return ctx.moveTo(e.pageX, e.pageY);
  };
  window.onend = function(e) {
    e.preventDefault();
    ctx.closePath();
    c.broadcast(localPoints);
    strokes.push(localPoints);
    localPoints = [];
    return paintingOn = false;
  };
  window.drawStroke = function(points) {
    var point, _i, _len;
    if (points.length === 0) {
      return;
    }
    ctx.moveTo(points[0].x, points[0].y);
    ctx.beginPath();
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      ctx.lineWidth = 2;
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    ctx.closePath();
    if (localPoints.length) {
      return ctx.moveTo(localPoints[0].x, localPoints[0].y);
    }
  };
  window.undo = function() {
    var s, _i, _len, _results;
    strokes.pop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _results = [];
    for (_i = 0, _len = strokes.length; _i < _len; _i++) {
      s = strokes[_i];
      _results.push(drawStroke(s));
    }
    return _results;
  };
  if (window.navigator.msPointerEnabled) {
    canvas.addEventListener('MSPointerDown', onstart, false);
    canvas.addEventListener('MSPointerMove', onmove, false);
    return canvas.addEventListener('MSPointerUp', onend, false);
  } else {
    canvas.addEventListener('touchstart', onstart, false);
    canvas.addEventListener('mousedown', onstart, false);
    canvas.addEventListener('touchmove', onmove, false);
    canvas.addEventListener('mousemove', onmove, false);
    canvas.addEventListener('touchend', onend, false);
    return canvas.addEventListener('mouseup', onend, false);
  }
};
