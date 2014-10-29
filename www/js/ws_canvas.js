window.WSCanvas = (function() {
  function WSCanvas() {
    this.canvas = document.getElementById("canvas");
    this.canvasTemp = document.getElementById("canvas-temp");
    this.ctx = this.canvas.getContext("2d");
    this.ctxTemp = this.canvasTemp.getContext("2d");
    this.color = '#666';
    this.colorPickerIcon = document.getElementById('tool-color-picker');
    this.colorPicker = document.getElementById('color-picker');
    this.colorPickerHammer = new Hammer(this.colorPicker, {});
    this.colorPickerIconHammer = new Hammer(this.colorPickerIcon, {});
    this.undoHammer = new Hammer(document.getElementById('tool-undo'), {});
    this.redoHammer = new Hammer(document.getElementById('tool-redo'), {});
    this.attachEvents();
  }

  WSCanvas.prototype.fitToScreen = function() {
    this.canvas.classList.remove('hidden');
    this.canvasTemp.classList.remove('hidden');
    this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.canvasTemp.height = this.canvas.clientHeight;
    return this.canvasTemp.width = this.canvas.clientWidth;
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
    this.ctxTemp.beginPath();
    this.ctxTemp.lineJoin = this.ctxTemp.lineCap = 'round';
    this.ctxTemp.shadowBlur = 2;
    this.ctxTemp.lineWidth = 3;
    this.ctxTemp.shadowColor = this.color;
    this.ctxTemp.strokeStyle = this.color;
    return this.ctxTemp.moveTo(e.pageX, e.pageY);
  };

  WSCanvas.prototype.onmove = function(e) {
    e.preventDefault();
    if (e.touches) {
      e = e.touches[0];
    }
    if (this.paintingOn) {
      this.localPoints.push([e.pageX, e.pageY]);
      this.ctxTemp.lineTo(e.pageX, e.pageY);
      return this.ctxTemp.stroke();
    }
  };

  WSCanvas.prototype.onend = function(e) {
    var stroke;
    e.preventDefault();
    this.ctxTemp.closePath();
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
    if (stroke.cancelled) {
      return;
    }
    points = stroke.points;
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
    return this.ctx.closePath();
  };

  WSCanvas.prototype.showColorPicker = function() {
    this.canvas.classList.add('hidden');
    this.canvasTemp.classList.add('hidden');
    return this.colorPicker.classList.remove('hidden');
  };

  WSCanvas.prototype.selectColor = function(e) {
    this.colorPicker.classList.add('hidden');
    this.canvas.classList.remove('hidden');
    this.canvasTemp.classList.remove('hidden');
    return this.color = getComputedStyle(e.target).backgroundColor;
  };

  WSCanvas.prototype.rerender = function() {
    var s, _i, _len, _ref, _results;
    this.ctx.beginPath();
    this.ctx.clearRect(0, 0, 10000, 10000);
    this.ctx.closePath();
    this.ctxTemp.beginPath();
    this.ctxTemp.clearRect(0, 0, 10000, 10000);
    this.ctxTemp.closePath();
    _ref = this.strokes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      _results.push(this.drawStroke(s));
    }
    return _results;
  };

  WSCanvas.prototype.lastUncancelledStroke = function() {
    var i;
    i = this.strokes.length - 1;
    while (this.strokes[i].cancelled && i !== 0) {
      i--;
    }
    return this.strokes[i];
  };

  WSCanvas.prototype.lastCancelledStroke = function() {
    var i;
    i = this.strokes.length - 1;
    while (this.strokes[i].cancelled && i !== 0) {
      i--;
    }
    if (i === this.strokes.length - 1) {
      return;
    }
    i++;
    return this.strokes[i];
  };

  WSCanvas.prototype.strokeWithId = function(id) {
    var i;
    i = this.strokes.length - 1;
    while (this.strokes[i].id !== id && i !== 0) {
      i--;
    }
    return this.strokes[i];
  };

  WSCanvas.prototype.undo = function(id) {
    var stroke;
    stroke = {};
    if (id) {
      stroke = this.strokeWithId(id);
    } else {
      stroke = this.lastUncancelledStroke();
    }
    if (!stroke) {
      return;
    }
    stroke.cancelled = true;
    this.rerender();
    return stroke.id;
  };

  WSCanvas.prototype.undoLocal = function() {
    var id;
    id = this.undo();
    if (!id) {
      return;
    }
    return c.broadcast({
      type: 'undo',
      id: id
    });
  };

  WSCanvas.prototype.redo = function(id) {
    var stroke;
    stroke = {};
    if (id) {
      stroke = this.strokeWithId(id);
    } else {
      stroke = this.lastCancelledStroke();
    }
    if (!stroke) {
      return;
    }
    stroke.cancelled = false;
    this.rerender();
    return stroke.id;
  };

  WSCanvas.prototype.redoLocal = function() {
    var id;
    id = this.redo();
    if (!id) {
      return;
    }
    return c.broadcast({
      type: 'redo',
      id: id
    });
  };

  WSCanvas.prototype.attachEvents = function() {
    if (window.navigator.msPointerEnabled) {
      this.canvasTemp.addEventListener('MSPointerDown', this.onstart.bind(this), true);
      this.canvasTemp.addEventListener('MSPointerMove', this.onmove.bind(this), true);
      this.canvasTemp.addEventListener('MSPointerUp', this.onend.bind(this), true);
    } else {
      this.canvasTemp.addEventListener('touchstart', this.onstart.bind(this), true);
      this.canvasTemp.addEventListener('mousedown', this.onstart.bind(this), true);
      this.canvasTemp.addEventListener('touchmove', this.onmove.bind(this), true);
      this.canvasTemp.addEventListener('mousemove', this.onmove.bind(this), true);
      this.canvasTemp.addEventListener('touchend', this.onend.bind(this), true);
      this.canvasTemp.addEventListener('mouseup', this.onend.bind(this), true);
    }
    this.colorPickerIconHammer.on('tap', this.showColorPicker.bind(this));
    this.colorPickerHammer.on('tap', this.selectColor.bind(this));
    this.undoHammer.on('tap', this.undoLocal.bind(this));
    return this.redoHammer.on('tap', this.redoLocal.bind(this));
  };

  WSCanvas.prototype.strokeIsDrawn = function(stroke) {
    var s, _i, _len, _ref;
    _ref = this.strokes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (s.id === stroke.id) {
        return true;
      }
    }
    return false;
  };

  return WSCanvas;

})();
