class window.WSCanvas
  undoStack: []
  color: '#666'
  localPoints: []
  strokes: []
  paintingOn: false
  drawnStrokes: {}
  mode: 'l'

  constructor: () ->
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
    if e.touches
      e = e.touches[0]
    @paintingOn = true
    @ctxTemp.beginPath()
    @ctxTemp.lineJoin = @ctxTemp.lineCap = 'round'
    #@ctxTemp.shadowBlur = 2
    @ctxTemp.lineWidth = 3
    @ctxTemp.shadowColor = @color
    @ctxTemp.strokeStyle = @color
    @ctxTemp.fillStyle = @color
    @ctxTemp.moveTo(e.pageX, e.pageY)
    @undoStack = []
    @localPoints.push [e.pageX, e.pageY]

  onmove: (e) ->
    e.preventDefault()
    if e.touches
      e = e.touches[0]
    if @paintingOn
      if @mode == 'r'
        @ctxTemp.beginPath()
        @ctxTemp.clearRect(0,0,10000,10000)
        @ctxTemp.closePath()
        @ctxTemp.fillRect(
          @localPoints[0][0]
          @localPoints[0][1]
          e.pageX - @localPoints[0][0]
          e.pageY - @localPoints[0][1]
        )
        @ctxTemp.stroke()
      else if @mode == 'c'
        @ctxTemp.beginPath()
        @ctxTemp.clearRect(0,0,10000,10000)
        @ctxTemp.closePath()
        radius = Math.sqrt(
          Math.pow(@localPoints[0][0] - e.pageX,2) + Math.pow(@localPoints[0][1] - e.pageY,2)
        )
        @ctxTemp.arc(@localPoints[0][0], @localPoints[0][1], radius, 0, Math.PI*2, true)
        @ctxTemp.fill()
      else
        @localPoints.push [e.pageX, e.pageY]
        @ctxTemp.lineTo(e.pageX, e.pageY)
        @ctxTemp.stroke()

  onend: (e) ->
    e.preventDefault()
    if e.touches
      e = e.touches[0]
    @localPoints.push [e.pageX, e.pageY]
    console.log e.pageX
    @ctxTemp.closePath()
    stroke =
      points: @localPoints
      color: @color
      id: Math.random()
      mode: @mode
    @strokes.push stroke
    @drawnStrokes[stroke.id] = true
    @localPoints = []
    @paintingOn = false
    c.broadcast stroke
    @rerender()

  drawStroke: (stroke) ->
    #console.log stroke
    if stroke.cancelled
      return
    #if stroke.type == 'undo'
    #  return @undo stroke.stroke_id
    points = stroke.points
    @ctx.beginPath()
    @ctx.lineJoin = @ctxTemp.lineCap = 'round'
    #@ctx.shadowBlur = 2
    @ctx.lineWidth = 3
    @ctx.shadowColor = stroke.color
    @ctx.strokeStyle = stroke.color
    @ctx.fillStyle = stroke.color
    if stroke.mode == 'l'
      for p in points
        @ctx.lineTo p[0], p[1]
    else if stroke.mode == 'r'
      return if !(points.length > 1)
      @ctx.fillRect(
        points[0][0]
        points[0][1]
        points[1][0] - points[0][0]
        points[1][1] - points[0][1]
      )
    else if stroke.mode == 'c'
      return if !(points.length > 1)
        Math.pow(points[0][0] - points[1][0], 2) + Math.pow(points[0][1] - points[1][1],2)
      radius = Math.sqrt(
      )
      for p in points
        @ctx.arc(points[0][0], points[0][1], radius,0, Math.PI * 2, false)
        @ctx.fill()
    @ctx.stroke()
    @ctx.closePath()

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
    @ctx.beginPath()
    @ctx.clearRect(0,0,10000,10000)
    @ctx.closePath()
    @ctxTemp.beginPath()
    @ctxTemp.clearRect(0,0,10000,10000)
    @ctxTemp.closePath()

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

  initHamers: ->
    @ctxTempHammer = new Hammer @canvasTemp, {}
    @colorPickerHammer = new Hammer @colorPicker, {}
    @colorPickerIconHammer = new Hammer @colorPickerIcon, {}
    @undoHammer = new Hammer document.getElementById('tool-undo'), {}
    @redoHammer = new Hammer document.getElementById('tool-redo'), {}
    @circleHammer = new Hammer @circleIcon, {}
    @rectangleHammer = new Hammer @rectangleIcon, {}
    @brushHammer = new Hammer @brushIcon, {}

  initElements: ->
    @canvas = document.getElementById("canvas")
    @canvasTemp = document.getElementById("canvas-temp")
    @ctx = @canvas.getContext("2d")
    @ctxTemp = @canvasTemp.getContext("2d")
    @colorPickerIcon = document.getElementById('tool-color-picker')
    @circleIcon = document.getElementById('tool-circle')
    @brushIcon = document.getElementById('tool-brush')
    @rectangleIcon = document.getElementById('tool-rectangle')
    @colorPicker = document.getElementById('color-picker')
