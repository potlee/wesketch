console.log "INIT COLLABRIFY FROM coffee"

window.c = new CollabrifyClient
  application_id: '4891981239025664',
  user_id: 'collabrify.tester@gmail.com'

c.createSession
  name: 'potlee.wesketch31',
  tags: ['potlee.wesketch31'],
  startPaused: false

.then (session) ->
  console.log('CREATED: ', session)

.catch (error) ->
  c.listSessions(['potlee.wesketch31'])
  .then (sessions) ->
    c.joinSession session: sessions[0]
  .then (session) ->
    console.log 'JOINED: ', session
  .catch console.log
c.on 'event', (e) ->
  e = e.data()
  console.log e
  unless c.participant.participant_id == e.participant_id
    window.drawRemote(e)
