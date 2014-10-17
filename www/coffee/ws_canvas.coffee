class window.WSCanvas
  constructor: () ->
    @canvas = document.getElementsByClassName("canvas")[0]
    @ctx = @canvas.getContext("2d")
    @color = '#666'
    @colorPickerIcon = document.getElementById('tool-color-picker')
    @colorPicker = document.getElementById('color-picker')
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
    @paintingOn = true
    @ctx.beginPath()
    @ctx.moveTo(e.pageX, e.pageY)

  onmove: (e) ->
    e.preventDefault()
    if(@paintingOn)
      @localPoints.push x: e.pageX, y: e.pageY
      @ctx.lineWidth = 2
      @ctx.strokeStyle = @color
      @ctx.lineTo(e.pageX, e.pageY)
      @ctx.stroke()

  onend: (e) ->
    e.preventDefault()
    @ctx.closePath()
    @strokes.push(@localPoints)
    c.broadcast({points: @localPoints, color: @color})
    @localPoints = []
    @paintingOn = false

  drawStroke: (stroke) ->
    points = stroke.points
    if points.length == 0
      return
    @ctx.closePath()
    @ctx.moveTo(points[0].x, points[0].y)
    @ctx.beginPath()
    for point in points
      @ctx.lineWidth = 2
      @ctx.strokeStyle = stroke.color
      @ctx.lineTo(point.x, point.y)
      @ctx.stroke()
    @ctx.closePath()
    if @localPoints.length
      @ctx.moveTo(@localPoints.last().x, @localPoints.last().y)
      @ctx.beginPath()

  showColorPicker: () ->
    @canvas.classList.add 'hidden'
    @colorPicker.classList.remove 'hidden'

  selectColor: (e) ->
    console.log e.target
    @colorPicker.classList.add 'hidden'
    @canvas.classList.remove 'hidden'
    @color = e.target.getAttribute '_color'

  #undo: () ->
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
      @canvas.addEventListener('MSPointerDown', @onstart,  false)
      @canvas.addEventListener('MSPointerMove', @onmove, false)
      @canvas.addEventListener('MSPointerUp', @onend, false)
      @colorPickerIcon.addEventListener('MSPointerUp', @showColorPicker.bind(this), false)
      #@colorPicker.addEventListener('MSPointerUp', @selectColor.bind(this). false)
    else
      @canvas.addEventListener('touchstart', @onstart.bind(this),  false)
      @canvas.addEventListener('mousedown', @onstart.bind(this),  false)
      @canvas.addEventListener('touchmove', @onmove.bind(this), false)
      @canvas.addEventListener('mousemove', @onmove.bind(this), false)
      @canvas.addEventListener('touchend', @onend.bind(this), false)
      @canvas.addEventListener('mouseup', @onend.bind(this), false)
      @colorPickerIcon.addEventListener('mouseup', @showColorPicker.bind(this), false)
      @colorPickerIcon.addEventListener('touchend', @showColorPicker.bind(this), false)
    @colorPicker.addEventListener('click', @selectColor.bind(this), false)
      #@colorPicker.addEventListener('touchend', @selectColor.bind(this), false)
