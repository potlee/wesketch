(function() {
  window.initDraw = function() {
    var canvas, ctx, h, localPoints, paintingOn, w;
    canvas = document.getElementsByClassName("canvas")[0];
    canvas.classList.remove('hidden');
    ctx = canvas.getContext("2d");
    ctx.beginPath();
    paintingOn = false;
    h = canvas.height = screen.height;
    w = canvas.width = screen.width;
    localPoints = [];
    window.onmove = function(e) {
      if (paintingOn) {
        e.preventDefault();
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
      paintingOn = true;
      return ctx.moveTo(e.pageX, e.pageY);
    };
    window.onend = function(e) {
      c.broadcast(localPoints);
      localPoints = [];
      return paintingOn = false;
    };
    window.drawRemote = function(points) {
      var point, _i, _len;
      if (points.length === 0) {
        return;
      }
      ctx.moveTo(points[0].x, points[0].y);
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        ctx.lineWidth = 2;
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      if (localPoints.length) {
        return ctx.moveTo(localPoints[0].x, localPoints[0].y);
      }
    };
    canvas.addEventListener('touchstart', onstart, false);
    canvas.addEventListener('mousedown', onstart, false);
    canvas.addEventListener('touchmove', onmove, false);
    canvas.addEventListener('mousemove', onmove, false);
    canvas.addEventListener('touchend', onend, false);
    return canvas.addEventListener('mouseup', onend, false);
  };

}).call(this);
