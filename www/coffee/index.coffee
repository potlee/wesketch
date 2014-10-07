window.initDraw = ->
  canvas = document.getElementsByClassName("canvas")[0]
  ctx = canvas.getContext("2d")
  paintingOn = false
  canvas.height = screen.height
  canvas.width = screen.width
  localPoints = []

  window.onmove = (e) ->
    if(paintingOn)
      e.preventDefault()
      localPoints.push x: e.pageX, y: e.pageY
      ctx.lineTo(e.pageX, e.pageY)
      ctx.stroke()

  window.onstart = (e) ->
    paintingOn = true
    ctx.moveTo(e.pageX, e.pageY)

  window.onend = (e) ->
    c.broadcast(localPoints)
    localPoints = []
    paintingOn = false

  window.drawRemote = (points) ->
    ctx.moveTo(points[0].x, points[0].y)
    for point in points
      ctx.lineTo(point.x, point.y)
      ctx.stroke()

  canvas.addEventListener('touchstart', onstart,  false)
  canvas.addEventListener('mousedown', onstart,  false)
  canvas.addEventListener('touchmove', onmove, false)
  canvas.addEventListener('mousemove', onmove, false)
  canvas.addEventListener('touchend', onend, false)
  canvas.addEventListener('mouseup', onend, false)
