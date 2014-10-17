window.initDraw = ->
  window.canvas = document.getElementsByClassName("canvas")[0]
  canvas.classList.remove('hidden')
  window.ctx = canvas.getContext("2d")
  paintingOn = false
  window.h = canvas.height = screen.height - 200
  w = canvas.width = screen.width
  localPoints = []

  window.onmove = (e) ->
    e.preventDefault()
    if(paintingOn)
      localPoints.push x: e.pageX, y: e.pageY
      ctx.lineWidth = 2
      ctx.lineTo(e.pageX, e.pageY)
      ctx.stroke()

  window.onstart = (e) ->
    e.preventDefault()
    ctx.beginPath()
    paintingOn = true
    ctx.moveTo(e.pageX, e.pageY)

  window.onend = (e) ->
    e.preventDefault()
    ctx.closePath()
    c.broadcast(localPoints)
    strokes.push(localPoints)
    localPoints = []
    paintingOn = false

  window.drawStroke = (points) ->
    if points.length == 0
      return
    ctx.moveTo(points[0].x, points[0].y)
    ctx.beginPath()
    for point in points
      ctx.lineWidth = 2
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    ctx.closePath()
    if localPoints.length
      ctx.moveTo(localPoints[0].x, localPoints[0].y)

  window.undo = () ->
    strokes.pop()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for s in strokes
      drawStroke s

  if (window.navigator.msPointerEnabled)
    canvas.addEventListener('MSPointerDown', onstart,  false)
    canvas.addEventListener('MSPointerMove', onmove, false)
    canvas.addEventListener('MSPointerUp', onend, false)
  else
    canvas.addEventListener('touchstart', onstart,  false)
    canvas.addEventListener('mousedown', onstart,  false)
    canvas.addEventListener('touchmove', onmove, false)
    canvas.addEventListener('mousemove', onmove, false)
    canvas.addEventListener('touchend', onend, false)
    canvas.addEventListener('mouseup', onend, false)
