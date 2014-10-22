window.WSCanvas = (function() {
  function WSCanvas() {
    this.canvas = document.getElementsByClassName("canvas")[0];
    this.canvas.classList.remove('hidden');
    this.ctx = canvas.getContext("2d");
    this.paintingOn = false;
    this.canvas.height = screen.height - 200;
    this.canvas.width = screen.width;
    this.localPoints = [];
    this.strokes = [];
    if (window.navigator.msPointerEnabled) {
      canvas.addEventListener('MSPointerDown', onstart, false);
      canvas.addEventListener('MSPointerMove', onmove, false);
      canvas.addEventListener('MSPointerUp', onend, false);
    } else {
      canvas.addEventListener('touchstart', onstart, false);
      canvas.addEventListener('mousedown', onstart, false);
      canvas.addEventListener('touchmove', onmove, false);
      canvas.addEventListener('mousemove', onmove, false);
      canvas.addEventListener('touchend', onend, false);
      canvas.addEventListener('mouseup', onend, false);
    }
  }

  WSCanvas.prototype.onstart = function(e) {
    this.e.preventDefault();
    this.ctx.beginPath();
    this.paintingOn = true;
    return this.ctx.moveTo(e.pageX, e.pageY);
  };

  WSCanvas.prototype.onmove = function(e) {
    e.preventDefault();
    if (paintingOn) {
      this.localPoints.push({
        x: e.pageX,
        y: e.pageY
      });
      this.ctx.lineWidth = 2;
      this.ctx.lineTo(e.pageX, e.pageY);
      return this.ctx.stroke();
    }
  };

  WSCanvas.prototype.onend = function(e) {
    e.preventDefault();
    this.ctx.closePath();
    this.strokes.push(this.localPoints);
    c.broadcast(this.localPoints);
    this.localPoints = [];
    return this.paintingOn = false;
  };

  WSCanvas.prototype.drawStroke = function(points) {
    var point, _i, _len;
    if (points.length === 0) {
      return;
    }
    this.ctx.moveTo(points[0].x, points[0].y);
    this.ctx.beginPath();
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      this.ctx.lineWidth = 2;
      this.ctx.lineTo(point.x, point.y);
      this.ctx.stroke();
    }
    this.ctx.closePath();
    if (localPoints.length) {
      return this.ctx.moveTo(this.localPoints.last().x, this.localPoints.last().y);
    }
  };

  return WSCanvas;

})();
