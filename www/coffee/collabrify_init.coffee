console.log "INIT COLLABRIFY FROM coffee"

tag = 'deepj' #prompt "Class: ", ''
window.redoQueue = []
window.strokes = []
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
    initDraw()

  .catch (error) ->
    c.listSessions([tag])
    .then (sessions) ->
      c.joinSession session: sessions[0]
    .then (session) ->
      console.log 'JOINED: ', session
      spinner.stop()
      initDraw()
    .catch console.log

  c.on 'event', (e) ->
    e = e.data()
    unless c.participant.participant_id == e.participant_id
      strokes.push(e)
      window.drawStroke(e)
