window.WSCanvas = (function() {
  function WSCanvas() {
    this.canvas = document.getElementsByClassName("canvas")[0];
    this.ctx = this.canvas.getContext("2d");
    this.color = '#666';
    this.colorPickerIcon = document.getElementById('tool-color-picker');
    this.colorPicker = document.getElementById('color-picker');
    this.attachEvents();
  }

  WSCanvas.prototype.fitToScreen = function() {
    this.canvas.classList.remove('hidden');
    this.canvas.height = this.canvas.clientHeight;
    return this.canvas.width = this.canvas.clientWidth;
  };

  WSCanvas.prototype.localPoints = [];

  WSCanvas.prototype.strokes = [];

  WSCanvas.prototype.paintingOn = false;

  WSCanvas.prototype.onstart = function(e) {
    e.preventDefault();
    this.paintingOn = true;
    this.ctx.beginPath();
    return this.ctx.moveTo(e.pageX, e.pageY);
  };

  WSCanvas.prototype.onmove = function(e) {
    e.preventDefault();
    if (this.paintingOn) {
      this.localPoints.push({
        x: e.pageX,
        y: e.pageY
      });
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = this.color;
      this.ctx.lineTo(e.pageX, e.pageY);
      return this.ctx.stroke();
    }
  };

  WSCanvas.prototype.onend = function(e) {
    e.preventDefault();
    this.ctx.closePath();
    this.strokes.push(this.localPoints);
    c.broadcast({
      points: this.localPoints,
      color: this.color
    });
    this.localPoints = [];
    return this.paintingOn = false;
  };

  WSCanvas.prototype.drawStroke = function(stroke) {
    var point, points, _i, _len;
    points = stroke.points;
    if (points.length === 0) {
      return;
    }
    this.ctx.closePath();
    this.ctx.moveTo(points[0].x, points[0].y);
    this.ctx.beginPath();
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = stroke.color;
      this.ctx.lineTo(point.x, point.y);
      this.ctx.stroke();
    }
    this.ctx.closePath();
    if (this.localPoints.length) {
      this.ctx.moveTo(this.localPoints.last().x, this.localPoints.last().y);
      return this.ctx.beginPath();
    }
  };

  WSCanvas.prototype.showColorPicker = function() {
    this.canvas.classList.add('hidden');
    return this.colorPicker.classList.remove('hidden');
  };

  WSCanvas.prototype.selectColor = function(e) {
    console.log(e.target);
    this.colorPicker.classList.add('hidden');
    this.canvas.classList.remove('hidden');
    return this.color = e.target.getAttribute('_color');
  };

  WSCanvas.prototype.attachEvents = function() {
    if (window.navigator.msPointerEnabled) {
      this.canvas.addEventListener('MSPointerDown', this.onstart, false);
      this.canvas.addEventListener('MSPointerMove', this.onmove, false);
      this.canvas.addEventListener('MSPointerUp', this.onend, false);
      return this.colorPickerIcon.addEventListener('MSPointerUp', this.showColorPicker.bind(this), false);
    } else {
      this.canvas.addEventListener('touchstart', this.onstart.bind(this), false);
      this.canvas.addEventListener('mousedown', this.onstart.bind(this), false);
      this.canvas.addEventListener('touchmove', this.onmove.bind(this), false);
      this.canvas.addEventListener('mousemove', this.onmove.bind(this), false);
      this.canvas.addEventListener('touchend', this.onend.bind(this), false);
      this.canvas.addEventListener('mouseup', this.onend.bind(this), false);
      this.colorPickerIcon.addEventListener('mouseup', this.showColorPicker.bind(this), false);
      this.colorPickerIcon.addEventListener('touchend', this.showColorPicker.bind(this), false);
      return this.colorPicker.addEventListener('click', this.selectColor.bind(this), false);
    }
  };

  return WSCanvas;

})();
