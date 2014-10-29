class window.WSCanvas
  constructor: () ->
    @canvas = document.getElementById("canvas")
    @canvasTemp = document.getElementById("canvas-temp")
    @ctx = @canvas.getContext("2d")
    @ctxTemp = @canvasTemp.getContext("2d")
    @color = '#666'
    @colorPickerIcon = document.getElementById('tool-color-picker')
    @colorPicker = document.getElementById('color-picker')
    @colorPickerHammer = new Hammer @colorPicker, {}
    @colorPickerIconHammer = new Hammer @colorPickerIcon, {}
    @undoHammer = new Hammer document.getElementById('tool-undo'), {}
    @attachEvents()

  fitToScreen: () ->
    @canvas.classList.remove('hidden')
    @canvasTemp.classList.remove('hidden')
    @canvas.height = @canvas.clientHeight
    @canvas.width = @canvas.clientWidth
    @canvasTemp.height = @canvas.clientHeight
    @canvasTemp.width = @canvas.clientWidth

  localPoints: []
  strokes: []
  paintingOn: false

  onstart: (e) ->
    e.preventDefault()
    if e.touches
      e = e.touches[0]
    @paintingOn = true
    @ctxTemp.beginPath()
    @ctxTemp.lineJoin = @ctxTemp.lineCap = 'round'
    @ctxTemp.shadowBlur = 2
    @ctxTemp.lineWidth = 3
    @ctxTemp.shadowColor = @color
    @ctxTemp.strokeStyle = @color
    @ctxTemp.moveTo(e.pageX, e.pageY)
    #@localPoints.push [e.pageX, e.pageY]

  onmove: (e) ->
    e.preventDefault()
    if e.touches
      e = e.touches[0]
    if(@paintingOn)
      @localPoints.push [e.pageX, e.pageY]
      @ctxTemp.lineTo(e.pageX, e.pageY)
      @ctxTemp.stroke()

  onend: (e) ->
    e.preventDefault()
    @ctxTemp.closePath()
    stroke =
      points: @localPoints
      color: @color
      id: Math.random()
    @strokes.push stroke
    @localPoints = []
    @paintingOn = false
    c.broadcast stroke
    #@rerender()

  drawStroke: (stroke) ->
    #console.log stroke
    if stroke.cancelled
      return
    #if stroke.type == 'undo'
    #  return @undo stroke.stroke_id
    points = stroke.points
    @ctx.beginPath()
    @ctx.lineJoin = @ctx.lineCap = 'round'
    @ctx.shadowBlur = 2
    @ctx.lineWidth = 3
    @ctx.shadowColor = stroke.color
    @ctx.strokeStyle = stroke.color
    for p in points
      @ctx.lineTo p[0], p[1]
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
    @rerender()
    stroke.id

  undoLocal: ->
    console.log "local"
    id = @undo()
    c.broadcast
      type: 'undo'
      id: id

  #  i = @strokes.length - 1
  #  while i
  #    if (!id and !@strokes[i].cancelled) or @strokes[i].id == id
  #      @strokes[i].cancelled = true
  #      if !id
  #        c.broadcast
  #          type: 'undo'
  #          stroke_id: @strokes[i].id
  #      break
  #    i--
  #  @rerender()
  #  @redoQueue.push @strokes.pop()
  #  @ctx.clearRect(0, 0, canvas.width, canvas.height)
  #  for s in strokes
  #    @drawStroke s

  #redo: () ->
  #  i = @strokes.length - 1
  #  while i
  #    if @strokes[i].cancelled
  #      @strokes[i].cancelled = false
  #      break
  #    if @strokes[i].cancelled == undefined
  #      break
  #  @rerender()

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

  # optimize to O(1) with map
  strokeIsDrawn: (stroke) ->
    for s in @strokes
      if s.id == stroke.id
        return true
    return false
