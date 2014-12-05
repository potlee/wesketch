var __slice = [].slice;

window.WSCanvas = (function() {
  function WSCanvas() {
    this.undoStack = [];
    this.localPoints = [];
    this.moveRect = [];
    this.strokes = [];
    this.frames = [
      {
        strokes: this.strokes,
        baseImage: null
      }
    ];
    this.drawnStrokes = {};
    this.color = '#666';
    this.mode = 'l';
    this.currentFrame = 0;
    this.paintingOn = false;
    this.initElements();
    this.initHamers();
    this.attachEvents();
    this.width = 4;
  }

  WSCanvas.prototype.fitToScreen = function() {
    this.mainScreen.classList.remove('hidden');
    this.toolbar.classList.remove('hidden');
    this.canvas.classList.remove('hidden');
    this.canvasTemp.classList.remove('hidden');
    this.canvas.height = this.canvas.clientHeight;
    this.canvas.width = this.canvas.clientWidth;
    this.canvasTemp.height = this.canvas.clientHeight;
    return this.canvasTemp.width = this.canvas.clientWidth;
  };

  WSCanvas.prototype.nextFrame = function() {
    if (this.currentFrame + 1 === this.frames.length) {
      this.tryNewFrame();
    }
    return this.goToFrame(this.currentFrame + 1);
  };

  WSCanvas.prototype.previousFrame = function() {
    return this.goToFrame(this.currentFrame - 1);
  };

  WSCanvas.prototype.goToFrame = function(frame) {
    if (this.frames[frame]) {
      this.strokes = this.frames[frame].strokes;
      this.currentFrame = frame;
      return this.rerender();
    } else {
      return console.log("no such frame");
    }
  };

  WSCanvas.prototype.newFrame = function() {
    return this.frames.push({
      strokes: [],
      baseImage: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    });
  };

  WSCanvas.prototype.tryNewFrame = function() {
    return c.broadcast({
      mode: 'f'
    });
  };

  WSCanvas.prototype.onstart = function(e) {
    var _ref, _ref1;
    e.preventDefault();
    if (e.touches) {
      e = e.touches[0];
    }
    this.paintingOn = true;
    if (this.moveRect.length === 2 && this.inMoveRect(e.pageX, e.pageY)) {
      this.mode = 'm';
      this.moveImageData = (_ref = this.ctx).getImageData.apply(_ref, this.rect(this.moveRect));
      (_ref1 = this.ctx).clearRect.apply(_ref1, this.rect(this.moveRect));
    }
    this.ctxTemp.beginPath();
    this.ctxTemp.lineJoin = this.ctxTemp.lineCap = 'round';
    this.ctxTemp.lineWidth = this.width;
    this.ctxTemp.strokeStyle = this.color;
    this.ctxTemp.fillStyle = this.color;
    this.ctxTemp.moveTo(e.pageX, e.pageY);
    this.undoStack = [];
    return this.localPoints = [[e.pageX, e.pageY]];
  };

  WSCanvas.prototype.onmove = function(e) {
    var p, radius, _i, _len, _ref, _ref1, _ref2;
    e.preventDefault();
    if (!this.paintingOn) {
      return;
    }
    if (e.touches) {
      e = e.touches[0];
    }
    this.ctxTemp.beginPath();
    this.ctxTemp.clearRect(0, 0, 10000, 10000);
    this.ctxTemp.closePath();
    switch (this.mode) {
      case 'r':
        this.localPoints[1] = [e.pageX, e.pageY];
        (_ref = this.ctxTemp).fillRect.apply(_ref, this.rect(this.localPoints));
        break;
      case 's':
        this.localPoints[1] = [e.pageX, e.pageY];
        (_ref1 = this.ctxTemp).strokeRect.apply(_ref1, this.rect(this.localPoints));
        if (this.localPoints[0][0] === e.pageX || this.localPoints[0][1] === e.pageY) {
          return;
        }
        this.copyToTemp(this.localPoints);
        break;
      case 'm':
        this.localPoints[1] = [e.pageX, e.pageY];
        this.ctxTemp.putImageData(this.moveImageData, Math.min(this.moveRect[0][0], this.moveRect[1][0]) - this.localPoints[0][0] + e.pageX, Math.min(this.moveRect[0][1], this.moveRect[1][1]) - this.localPoints[0][1] + e.pageY);
        break;
      case 'c':
        this.localPoints[1] = [e.pageX, e.pageY];
        radius = Math.sqrt(Math.pow(this.localPoints[0][0] - e.pageX, 2) + Math.pow(this.localPoints[0][1] - e.pageY, 2));
        this.ctxTemp.arc(this.localPoints[0][0], this.localPoints[0][1], radius, 0, Math.PI * 2, true);
        this.ctxTemp.fill();
        break;
      case 'l':
        this.localPoints.push([e.pageX, e.pageY]);
        _ref2 = this.localPoints;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          p = _ref2[_i];
          this.ctxTemp.lineTo(p[0], p[1]);
        }
        break;
      default:
        throw new Error('mode: ', this.mode);
    }
    return this.ctxTemp.stroke();
  };

  WSCanvas.prototype.onend = function(e) {
    var stroke;
    e.preventDefault();
    this.ctxTemp.closePath();
    this.paintingOn = false;
    if (this.mode === 'm' && this.localPoints.length < 2) {
      return;
    }
    stroke = {
      points: this.localPoints,
      color: this.color,
      id: Math.random(),
      mode: this.mode,
      moveRect: this.mode === 'm' ? this.moveRect : void 0,
      width: this.mode === 'l' ? this.width : void 0,
      frame: this.currentFrame
    };
    this.moveRect = this.mode === 's' ? this.localPoints : [];
    this.localPoints = [];
    if (this.mode === 's') {
      return;
    }
    this.strokes.push(stroke);
    this.drawnStrokes[stroke.id] = true;
    if (this.mode === 'm') {
      this.mode = 's';
    }
    c.broadcast(stroke);
    this.rerender();
    if (stroke.cancelled || stroke.frame === !this.currentFrame) {

    }
  };

  WSCanvas.prototype.drawStroke = function(stroke) {
    var p, points, radius, rect, tempImageData, _i, _len, _ref, _ref1, _ref2;
    points = stroke.points;
    this.ctx.beginPath();
    this.ctx.lineJoin = this.ctxTemp.lineCap = 'round';
    this.ctx.lineWidth = stroke.width;
    this.ctx.shadowColor = stroke.color;
    this.ctx.strokeStyle = stroke.color;
    this.ctx.fillStyle = stroke.color;
    switch (stroke.mode) {
      case 'l':
        for (_i = 0, _len = points.length; _i < _len; _i++) {
          p = points[_i];
          this.ctx.lineTo(p[0], p[1]);
        }
        break;
      case 'r':
        if (!(points.length > 1)) {
          return;
        }
        (_ref = this.ctx).fillRect.apply(_ref, this.rect(points));
        break;
      case 'c':
        if (!(points.length > 1)) {
          return;
        }
        radius = Math.sqrt(Math.pow(points[0][0] - points[1][0], 2) + Math.pow(points[0][1] - points[1][1], 2));
        this.ctx.fillStyle = stroke.color;
        this.ctx.arc(points[0][0], points[0][1], radius, 0, Math.PI * 2, false);
        this.ctx.fill();
        break;
      case 'm':
        rect = this.rect(stroke.moveRect);
        tempImageData = (_ref1 = this.ctx).getImageData.apply(_ref1, rect);
        (_ref2 = this.ctx).clearRect.apply(_ref2, rect);
        this.ctxTemp.putImageData(tempImageData, Math.min(stroke.moveRect[0][0], stroke.moveRect[1][0]) - points[0][0] + points[1][0], Math.min(stroke.moveRect[0][1], stroke.moveRect[1][1]) - points[0][1] + points[1][1]);
        this.ctx.drawImage(this.canvasTemp, 0, 0);
        this.ctxTemp.beginPath();
        this.ctxTemp.clearRect(0, 0, 10000, 10000);
        this.ctxTemp.closePath();
        break;
      case 'f':
        this.newFrame();
    }
    this.ctx.stroke();
    return this.ctx.closePath();
  };

  WSCanvas.prototype.rect = function(points) {
    var height, width, x, y;
    x = points[0][0];
    y = points[0][1];
    width = points[1][0] - points[0][0];
    height = points[1][1] - points[0][1];
    if (width < 0) {
      width = -width;
      x -= width;
    }
    if (height < 0) {
      height = -height;
      y -= height;
    }
    return [x, y, width, height];
  };

  WSCanvas.prototype.copyToTemp = function(points) {
    var rect, _ref;
    rect = this.rect(points);
    return (_ref = this.ctxTemp).drawImage.apply(_ref, [this.canvas].concat(__slice.call(rect), __slice.call(rect)));
  };

  WSCanvas.prototype.inMoveRect = function(x, y) {
    return (((this.moveRect[0][0] < x && x < this.moveRect[1][0])) || ((this.moveRect[1][0] < x && x < this.moveRect[0][0]))) && (((this.moveRect[0][1] < y && y < this.moveRect[1][1])) || ((this.moveRect[1][1] < y && y < this.moveRect[0][1])));
  };

  WSCanvas.prototype.showColorPicker = function() {
    this.canvas.classList.add('hidden');
    this.canvasTemp.classList.add('hidden');
    return this.colorPicker.classList.remove('hidden');
  };

  WSCanvas.prototype.showBrushPicker = function() {
    this.canvas.classList.add('hidden');
    this.canvasTemp.classList.add('hidden');
    return this.brushPicker.classList.remove('hidden');
  };

  WSCanvas.prototype.selectColor = function(e) {
    this.colorPicker.classList.add('hidden');
    this.canvas.classList.remove('hidden');
    this.canvasTemp.classList.remove('hidden');
    return this.color = getComputedStyle(e.target).backgroundColor;
  };

  WSCanvas.prototype.selectBursh = function(e) {
    this.brushPicker.classList.add('hidden');
    this.canvas.classList.remove('hidden');
    this.canvasTemp.classList.remove('hidden');
    this.width = parseInt(e.target.getAttribute('value'));
    return this.mode = 'l';
  };

  WSCanvas.prototype.rerender = function() {
    var s, _i, _len, _ref, _results;
    this.ctx.clearRect(0, 0, 10000, 10000);
    this.ctxTemp.clearRect(0, 0, 10000, 10000);
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
    this.undoStack.push(stroke.id);
    this.rerender();
    return stroke.id;
  };

  WSCanvas.prototype.undoLocal = function() {
    var id, stroke;
    id = this.undo();
    if (!id) {
      return;
    }
    stroke = {
      type: 'undo',
      id: Math.random(),
      strokeId: id
    };
    c.broadcast(stroke);
    return this.drawnStrokes[stroke.id] = true;
  };

  WSCanvas.prototype.redo = function(id) {
    var stroke;
    stroke = {};
    stroke = this.strokeWithId(id);
    if (!stroke) {
      return;
    }
    stroke.cancelled = false;
    this.rerender();
    return stroke.id;
  };

  WSCanvas.prototype.redoLocal = function() {
    var id, stroke;
    if (!this.undoStack.length) {
      return;
    }
    id = this.redo(this.undoStack.pop());
    if (!id) {
      return;
    }
    stroke = {
      type: 'redo',
      id: Math.random(),
      strokeId: id
    };
    c.broadcast(stroke);
    return this.drawnStrokes[stroke.id] = true;
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
    this.undoHammer.on('tap', this.undoLocal.bind(this));
    this.redoHammer.on('tap', this.redoLocal.bind(this));
    this.colorPickerIconHammer.on('tap', this.showColorPicker.bind(this));
    this.brushPickerIconHammer.on('tap', this.showBrushPicker.bind(this));
    this.colorPickerHammer.on('tap', this.selectColor.bind(this));
    this.brushPickerHammer.on('tap', this.selectBursh.bind(this));
    this.circleHammer.on('tap', (function(_this) {
      return function() {
        return _this.mode = 'c';
      };
    })(this));
    this.rectangleHammer.on('tap', (function(_this) {
      return function() {
        return _this.mode = 'r';
      };
    })(this));
    this.moveHammer.on('tap', (function(_this) {
      return function() {
        return _this.mode = 's';
      };
    })(this));
    return window.addEventListener('resize', (function(_this) {
      return function() {
        _this.fitToScreen();
        return _this.rerender();
      };
    })(this));
  };

  WSCanvas.prototype.initHamers = function() {
    var options;
    options = {
      interval: 1,
      time: 2000,
      threshold: 5
    };
    return [this.colorPickerHammer = new Hammer(this.colorPicker), this.colorPickerIconHammer = new Hammer(this.colorPickerIcon), this.undoHammer = new Hammer(document.getElementById('tool-undo')), this.redoHammer = new Hammer(document.getElementById('tool-redo')), this.circleHammer = new Hammer(this.circleIcon), this.rectangleHammer = new Hammer(this.rectangleIcon), this.brushPickerIconHammer = new Hammer(this.brushPickerIcon), this.brushPickerHammer = new Hammer(this.brushPicker), this.moveHammer = new Hammer(this.moveIcon)].forEach(function(h) {
      return h.get('tap').set(options);
    });
  };

  WSCanvas.prototype.initElements = function() {
    this.canvas = document.getElementById("canvas");
    this.canvasTemp = document.getElementById("canvas-temp");
    this.ctx = this.canvas.getContext("2d");
    this.ctxTemp = this.canvasTemp.getContext("2d");
    this.colorPickerIcon = document.getElementById('tool-color-picker');
    this.colorPicker = document.getElementById('color-picker');
    this.brushPickerIcon = document.getElementById('tool-brush');
    this.brushPicker = document.getElementById('brush-picker');
    this.circleIcon = document.getElementById('tool-circle');
    this.rectangleIcon = document.getElementById('tool-rectangle');
    this.moveIcon = document.getElementById('tool-move');
    this.toolbar = document.getElementById('toolbar');
    return this.mainScreen = document.getElementById('main');
  };

  return WSCanvas;

})();
