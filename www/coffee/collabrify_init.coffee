console.log "INIT COLLABRIFY FROM coffee"
window.onerror = (e) -> alert JSON.stringify(e)
window.wsCanvas = new WSCanvas
Keyboard.automaticScrollToTopOnHiding = true if window.Keyboard
document.addEventListener 'focusout', (e) -> scrollTo(0, 0)
document.getElementById('go').onclick = ->
  document.getElementById('welcome-screen').classList.add('hidden')
  spinner.spin(document.body)
  tag = 'watercycledemo' + document.getElementById('sketch-name').value
  window.c = new CollabrifyClient
    application_id: '4891981239025664',
    user_id: 'collabrify.tester@gmail.com'

  c.createSession
    name: 'potlee.wesketch31',
    tags: [tag],
    startPaused: false

  .then (session) ->
    console.log('CREATED: ', session)
    #alert('CREATED: ')
    spinner.stop()

  .catch (error) ->
    c.listSessions([tag])
    .then (sessions) ->
      c.joinSession session: sessions[0]

    .then (session) ->
      console.log 'JOINED: ', session
      #alert 'JOINED: '

    .catch (e) -> alert(e)

  .then () ->
    spinner.stop()
    wsCanvas.fitToScreen()

  .catch (x) -> alert JSON.stringify(x)

  c.on 'event', (e) ->
    #if c.participant.participant_id.low == e.author_participant_id.low
    #  return
    e = e.data()
    if wsCanvas.drawnStrokes[e.id]
      return

    if e.type == 'undo'
      wsCanvas.undo e.strokeId
    else if e.type == 'redo'
      wsCanvas.redo e.strokeId
    else
      wsCanvas.strokes.push(e)
      wsCanvas.drawStroke(e)
    wsCanvas.drawnStrokes[e.id] = true
  c.on 'error', (e) -> alert(e)
