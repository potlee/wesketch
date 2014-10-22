window.WSCanvas = (function() {
  function WSCanvas() {
    this.canvas = document.getElementsByClassName("canvas")[0];
    this.ctx = this.canvas.getContext("2d");
    this.color = '#666';
    this.colorPickerIcon = document.getElementById('tool-color-picker');
    this.colorPicker = document.getElementById('color-picker');
    this.colorPickerHammer = new Hammer(this.colorPicker, {});
    this.colorPickerIconHammer = new Hammer(this.colorPickerIcon, {});
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
    if (e.touches) {
      e = e.touches[0];
    }
    this.paintingOn = true;
    this.ctx.beginPath();
    this.ctx.lineJoin = this.ctx.lineCap = 'round';
    this.ctx.shadowBlur = 2;
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = this.color;
    this.ctx.strokeStyle = this.color;
    return this.ctx.moveTo(e.pageX, e.pageY);
  };

  WSCanvas.prototype.onmove = function(e) {
    e.preventDefault();
    if (e.touches) {
      e = e.touches[0];
    }
    if (this.paintingOn) {
      this.localPoints.push([e.pageX, e.pageY]);
      this.ctx.lineTo(e.pageX, e.pageY);
      return this.ctx.stroke();
    }
  };

  WSCanvas.prototype.onend = function(e) {
    var stroke;
    e.preventDefault();
    this.ctx.closePath();
    stroke = {
      points: this.localPoints,
      color: this.color,
      id: Math.random()
    };
    this.strokes.push(stroke);
    this.localPoints = [];
    this.paintingOn = false;
    return c.broadcast(stroke);
  };

  WSCanvas.prototype.drawStroke = function(stroke) {
    var p, points, _i, _len;
    points = stroke.points;
    if (points.length === 0) {
      return;
    }
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.lineJoin = this.ctx.lineCap = 'round';
    this.ctx.shadowBlur = 2;
    this.ctx.lineWidth = 3;
    this.ctx.shadowColor = stroke.color;
    this.ctx.strokeStyle = stroke.color;
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      p = points[_i];
      this.ctx.lineTo(p[0], p[1]);
      this.ctx.stroke();
    }
    this.ctx.closePath();
    if (this.localPoints.length) {
      this.ctx.moveTo(this.localPoints.last()[0], this.localPoints.last()[1]);
      return this.ctx.beginPath();
    }
  };

  WSCanvas.prototype.showColorPicker = function() {
    this.canvas.classList.add('hidden');
    return this.colorPicker.classList.remove('hidden');
  };

  WSCanvas.prototype.selectColor = function(e) {
    this.colorPicker.classList.add('hidden');
    this.canvas.classList.remove('hidden');
    return this.color = getComputedStyle(e.target).backgroundColor;
  };

  WSCanvas.prototype.attachEvents = function() {
    if (window.navigator.msPointerEnabled) {
      this.canvas.addEventListener('MSPointerDown', this.onstart.bind(this), true);
      this.canvas.addEventListener('MSPointerMove', this.onmove.bind(this), true);
      this.canvas.addEventListener('MSPointerUp', this.onend.bind(this), true);
    } else {
      this.canvas.addEventListener('touchstart', this.onstart.bind(this), true);
      this.canvas.addEventListener('mousedown', this.onstart.bind(this), true);
      this.canvas.addEventListener('touchmove', this.onmove.bind(this), true);
      this.canvas.addEventListener('mousemove', this.onmove.bind(this), true);
      this.canvas.addEventListener('touchend', this.onend.bind(this), true);
      this.canvas.addEventListener('mouseup', this.onend.bind(this), true);
    }
    this.colorPickerIconHammer.on('tap', this.showColorPicker.bind(this));
    return this.colorPickerHammer.on('tap', this.selectColor.bind(this));
  };

  return WSCanvas;

})();
