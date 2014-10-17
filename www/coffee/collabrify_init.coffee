console.log "INIT COLLABRIFY FROM coffee"

window.wsCanvas = new WSCanvas

document.getElementById('go').onclick = ->
  document.getElementById('welcome-screen').classList.add('hidden')
  spinner.spin(document.body)
  tag = document.getElementById('sketch-name').value
  window.c = new CollabrifyClient
    application_id: '4891981239025664',
    user_id: 'collabrify.tester@gmail.com'

  c.createSession
    name: 'potlee.wesketch31',
    tags: [tag],
    startPaused: false

  .then (session) ->
    console.log('CREATED: ', session)
    spinner.stop()

  .catch (error) ->
    c.listSessions([tag])
    .then (sessions) ->
      c.joinSession session: sessions[0]

    .then (session) ->
      console.log 'JOINED: ', session

  .then () ->
    spinner.stop()
    wsCanvas.fitToScreen()

  .catch console.log

  c.on 'event', (e) ->
    e = e.data()
    unless c.participant.participant_id == e.participant_id
      wsCanvas.strokes.push(e)
      wsCanvas.drawStroke(e)
