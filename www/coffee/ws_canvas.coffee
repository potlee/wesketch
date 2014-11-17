class window.WSCanvas
  constructor: () ->
    @undoStack = []
    @color = '#666'
    @localPoints = []
    @moveRect = []
    @strokes = []
    @paintingOn = false
    @drawnStrokes = {}
    @mode = 'l'
    @initElements()
    @initHamers()
    @attachEvents()

  fitToScreen: () ->
    @canvas.classList.remove('hidden')
    @canvasTemp.classList.remove('hidden')
    @canvas.height = @canvas.clientHeight
    @canvas.width = @canvas.clientWidth
    @canvasTemp.height = @canvas.clientHeight
    @canvasTemp.width = @canvas.clientWidth

  onstart: (e) ->
    e.preventDefault()
    e = e.touches[0] if e.touches
    @paintingOn = true
    if @moveRect.length == 2 and @inMoveRect(e.pageX, e.pageY)
      @mode = 'm'
      @moveImageData = @ctx.getImageData(@rect(@moveRect)...)
      @ctx.clearRect(@rect(@moveRect)...)
    @ctxTemp.beginPath()
    @ctxTemp.lineJoin = @ctxTemp.lineCap = 'round'
    #@ctxTemp.shadowBlur = 2
    @ctxTemp.lineWidth = 3
    @ctxTemp.shadowColor = @color
    @ctxTemp.strokeStyle = @color
    @ctxTemp.fillStyle = @color
    @ctxTemp.moveTo(e.pageX, e.pageY)
    @undoStack = []
    @localPoints = [[e.pageX, e.pageY]]

  onmove: (e) ->
    e.preventDefault()
    return unless @paintingOn
    e = e.touches[0] if e.touches
    @ctxTemp.beginPath()
    @ctxTemp.clearRect(0,0,10000,10000)
    @ctxTemp.closePath()
    switch @mode
      when 'r'
        @localPoints[1] = [e.pageX, e.pageY]
        @ctxTemp.fillRect(@rect(@localPoints)...)

      when 's'
        @localPoints[1] = [e.pageX, e.pageY]
        @ctxTemp.strokeRect(@rect(@localPoints)...)
        if @localPoints[0][0] == e.pageX or @localPoints[0][1] == e.pageY
          return
        @copyToTemp(@localPoints)

      when 'm'
        @localPoints[1] = [e.pageX, e.pageY]
        @ctxTemp.putImageData(
          @moveImageData
          @moveRect[0][0] - @localPoints[0][0] + e.pageX
          @moveRect[0][1] - @localPoints[0][1] + e.pageY
        )

      when 'c'
        @localPoints[1] = [e.pageX, e.pageY]
        radius = Math.sqrt(
          Math.pow(@localPoints[0][0] - e.pageX,2) + Math.pow(@localPoints[0][1] - e.pageY,2)
        )
        @ctxTemp.arc(@localPoints[0][0], @localPoints[0][1], radius, 0, Math.PI*2, true)
        @ctxTemp.fill()

      when 'l'
        @localPoints.push [e.pageX, e.pageY]
        for p in @localPoints
          @ctxTemp.lineTo(p[0],p[1])

      else throw new Error('mode: ', @mode)

    @ctxTemp.stroke()

  onend: (e) ->
    e.preventDefault()
    @ctxTemp.closePath()
    @paintingOn = false
    stroke =
      points: @localPoints
      color: @color
      id: Math.random()
      mode: @mode
      moveRect: @moveRect if @mode is 'm'
    @moveRect = if @mode is 's' then @localPoints else []
    @localPoints = []
    return if @mode is 's'
    @strokes.push stroke
    @drawnStrokes[stroke.id] = true
    @mode = 's' if @mode is 'm'
    c.broadcast stroke
    @rerender()

  drawStroke: (stroke) ->
    return if stroke.cancelled
    points = stroke.points
    @ctx.beginPath()
    @ctx.lineJoin = @ctxTemp.lineCap = 'round'
    #@ctx.shadowBlur = 2
    @ctx.lineWidth = 3
    @ctx.shadowColor = stroke.color
    @ctx.strokeStyle = stroke.color
    @ctx.fillStyle = stroke.color
    switch stroke.mode
      when 'l'
        for p in points
          @ctx.lineTo p[0], p[1]

      when 'r'
        return if !(points.length > 1)
        @ctx.fillRect(@rect(points)...)

      when 'c'
        return if !(points.length > 1)
        radius = Math.sqrt(
          Math.pow(points[0][0] - points[1][0], 2) + Math.pow(points[0][1] - points[1][1],2)
        )
        @ctx.arc(points[0][0], points[0][1], radius,0, Math.PI * 2, false)
        @ctx.fill()

      when 'm'
        rect = @rect(stroke.moveRect)
        tempImageData = @ctx.getImageData rect...
        @ctx.clearRect rect...
        @ctx.putImageData(
          tempImageData
          stroke.moveRect[0][0] - points[0][0] + points[1][0]
          stroke.moveRect[0][1] - points[0][1] + points[1][1]
        )

    @ctx.stroke()
    @ctx.closePath()

  rect: (points) ->
    x = points[0][0]
    y = points[0][1]
    width = points[1][0] - points[0][0]
    height = points[1][1] - points[0][1]
    if width < 0
      width = -width
      x -= width
    if height < 0
      height = - height
      y -= height
    [x, y, width, height]


  copyToTemp: (points) ->
    rect = @rect(points)
    @ctxTemp.drawImage(@canvas, rect..., rect...)

  inMoveRect: (x, y) ->
    ((@moveRect[0][0] < x < @moveRect[1][0]) or (@moveRect[1][0] < x < @moveRect[0][0])) and
    ((@moveRect[0][1] < y < @moveRect[1][1]) or (@moveRect[1][1] < y < @moveRect[0][1]))

  showColorPicker: () ->
    @canvas.classList.add 'hidden'
    @canvasTemp.classList.add 'hidden'
    @colorPicker.classList.remove 'hidden'

  selectColor: (e) ->
    @colorPicker.classList.add 'hidden'
    @canvas.classList.remove 'hidden'
    @canvasTemp.classList.remove 'hidden'
    @color = getComputedStyle(e.target).backgroundColor

  rerender: ->
    @ctx.clearRect(0,0,10000,10000)
    @ctxTemp.clearRect(0,0,10000,10000)

    for s in @strokes
      @drawStroke(s)

  lastUncancelledStroke: ->
    i = @strokes.length - 1
    i-- while @strokes[i].cancelled and i != 0
    @strokes[i]

  strokeWithId: (id) ->
    i = @strokes.length - 1
    i-- while @strokes[i].id != id and i != 0
    @strokes[i]

  undo: (id) ->
    stroke = {}
    if id
      stroke = @strokeWithId(id)
    else
      stroke = @lastUncancelledStroke()
    return if !stroke
    stroke.cancelled = true
    @undoStack.push stroke.id
    @rerender()
    stroke.id

  undoLocal: ->
    id = @undo()
    return if !id
    stroke =
      type: 'undo'
      id: Math.random()
      strokeId: id
    c.broadcast stroke
    @drawnStrokes[stroke.id] = true

  redo: (id) ->
    stroke = {}
    stroke = @strokeWithId(id)
    return if !stroke
    stroke.cancelled = false
    @rerender()
    stroke.id

  redoLocal: ->
    return if not @undoStack.length
    id = @redo(@undoStack.pop())
    return if !id
    stroke =
      type: 'redo'
      id: Math.random()
      strokeId: id
    c.broadcast stroke
    @drawnStrokes[stroke.id] = true

  attachEvents: () ->
    if (window.navigator.msPointerEnabled)
      @canvasTemp.addEventListener('MSPointerDown', @onstart.bind(this), true)
      @canvasTemp.addEventListener('MSPointerMove', @onmove.bind(this), true)
      @canvasTemp.addEventListener('MSPointerUp', @onend.bind(this), true)
    else
      @canvasTemp.addEventListener('touchstart', @onstart.bind(this), true)
      @canvasTemp.addEventListener('mousedown', @onstart.bind(this),  true)
      @canvasTemp.addEventListener('touchmove', @onmove.bind(this), true)
      @canvasTemp.addEventListener('mousemove', @onmove.bind(this), true)
      @canvasTemp.addEventListener('touchend', @onend.bind(this), true)
      @canvasTemp.addEventListener('mouseup', @onend.bind(this), true)
    @colorPickerIconHammer.on 'tap', @showColorPicker.bind(this)
    @colorPickerHammer.on 'tap', @selectColor.bind(this)
    @undoHammer.on 'tap', @undoLocal.bind(this)
    @redoHammer.on 'tap', @redoLocal.bind(this)
    @circleHammer.on 'tap', => @mode = 'c'
    @rectangleHammer.on 'tap', => @mode = 'r'
    @brushHammer.on 'tap', => @mode = 'l'
    @moveHammer.on 'tap', => @mode = 's'

  initHamers: ->
    options =
      interval: 1
      time: 2000
      threshold: 5
    [
      @colorPickerHammer = new Hammer @colorPicker
      @colorPickerIconHammer = new Hammer @colorPickerIcon
      @undoHammer = new Hammer document.getElementById('tool-undo')
      @redoHammer = new Hammer document.getElementById('tool-redo')
      @circleHammer = new Hammer @circleIcon
      @rectangleHammer = new Hammer @rectangleIcon
      @brushHammer = new Hammer @brushIcon
      @moveHammer = new Hammer @moveIcon
    ].forEach (h) ->
      h.get('tap').set options

  initElements: ->
    @canvas = document.getElementById("canvas")
    @canvasTemp = document.getElementById("canvas-temp")
    @ctx = @canvas.getContext("2d")
    @ctxTemp = @canvasTemp.getContext("2d")
    @colorPickerIcon = document.getElementById('tool-color-picker')
    @circleIcon = document.getElementById('tool-circle')
    @brushIcon = document.getElementById('tool-brush')
    @rectangleIcon = document.getElementById('tool-rectangle')
    @moveIcon = document.getElementById('tool-move')
    @colorPicker = document.getElementById('color-picker')
