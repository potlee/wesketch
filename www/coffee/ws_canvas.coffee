class window.WSCanvas
  constructor: () ->
    @canvas = document.getElementsByClassName("canvas")[0]
    @ctx = @canvas.getContext("2d")
    @color = '#666'
    @colorPickerIcon = document.getElementById('tool-color-picker')
    @colorPicker = document.getElementById('color-picker')
    @colorPickerHammer = new Hammer @colorPicker, {}
    @colorPickerIconHammer = new Hammer @colorPickerIcon, {}
    @attachEvents()

  fitToScreen: () ->
    @canvas.classList.remove('hidden')
    @canvas.height = @canvas.clientHeight
    @canvas.width = @canvas.clientWidth

  localPoints: []
  strokes: []
  paintingOn: false

  onstart: (e) ->
    e.preventDefault()
    if e.touches
      e = e.touches[0]
    @paintingOn = true
    @ctx.beginPath()
    @ctx.moveTo(e.pageX, e.pageY)
    @localPoints.push [e.pageX, e.pageY]

  onmove: (e) ->
    e.preventDefault()
    if e.touches
      e = e.touches[0]
    if(@paintingOn)
      @localPoints.push [e.pageX, e.pageY]
      @ctx.lineWidth = 2
      @ctx.strokeStyle = @color
      @ctx.lineTo(e.pageX, e.pageY)
      @ctx.stroke()

  onend: (e) ->
    e.preventDefault()
    @ctx.closePath()
    stroke =
      points: @localPoints
      color: @color
      id: Math.random()
    @strokes.push stroke
    @localPoints = []
    @paintingOn = false
    c.broadcast stroke
    @rerender()

  drawStroke: (stroke) ->
    points = stroke.points
    console.log points
    if points.length == 0
      return
    @ctx.closePath()
    @ctx.moveTo(points[0][0], points[0][1])
    @ctx.beginPath()
    @ctx.lineWidth = 2
    @ctx.strokeStyle = stroke.color
    @ctx.curve(points.flatten())
    @ctx.stroke()
    @ctx.closePath()
    if @localPoints.length
      @ctx.moveTo(@localPoints.last()[0], @localPoints.last()[1])
      @ctx.beginPath()

  showColorPicker: () ->
    @canvas.classList.add 'hidden'
    @colorPicker.classList.remove 'hidden'

  selectColor: (e) ->
    @colorPicker.classList.add 'hidden'
    @canvas.classList.remove 'hidden'
    @color = getComputedStyle(e.target).backgroundColor

  rerender: () ->
    @ctx.beginPath()
    @ctx.clearRect(0,0,10000,10000)
    @ctx.closePath()
    for s in @strokes
      console.log s
      @drawStroke(s)

  undo: () ->
    i = @strokes.length - 1
    while i
      if @strokes[i].cancelled
        @strokes[i].cancelled = true
        break
      i--
    rerender()
  #  @redoQueue.push @strokes.pop()
  #  @ctx.clearRect(0, 0, canvas.width, canvas.height)
  #  for s in strokes
  #    @drawStroke s

  #redo: () ->
  #  s = @redoQueue.pop()
  #  @strokes.push(s)
  #  @drawStroke s
  attachEvents: () ->
    if (window.navigator.msPointerEnabled)
      @canvas.addEventListener('MSPointerDown', @onstart.bind(this),  true)
      @canvas.addEventListener('MSPointerMove', @onmove.bind(this), true)
      @canvas.addEventListener('MSPointerUp', @onend.bind(this), true)
    else
      @canvas.addEventListener('touchstart', @onstart.bind(this),  true)
      @canvas.addEventListener('mousedown', @onstart.bind(this),  true)
      @canvas.addEventListener('touchmove', @onmove.bind(this), true)
      @canvas.addEventListener('mousemove', @onmove.bind(this), true)
      @canvas.addEventListener('touchend', @onend.bind(this), true)
      @canvas.addEventListener('mouseup', @onend.bind(this), true)
    @colorPickerIconHammer.on 'tap', @showColorPicker.bind(this)
    @colorPickerHammer.on 'tap', @selectColor.bind(this)
