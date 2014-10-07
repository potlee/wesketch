(function() {
  console.log("INIT COLLABRIFY FROM coffee");

  window.c = new CollabrifyClient({
    application_id: '4891981239025664',
    user_id: 'collabrify.tester@gmail.com'
  });

  c.createSession({
    name: 'potlee.wesketch31',
    tags: ['potlee.wesketch31'],
    startPaused: false
  }).then(function(session) {
    return console.log('CREATED: ', session);
  })["catch"](function(error) {
    return c.listSessions(['potlee.wesketch31']).then(function(sessions) {
      return c.joinSession({
        session: sessions[0]
      });
    }).then(function(session) {
      return console.log('JOINED: ', session);
    })["catch"](console.log);
  });

  c.on('event', function(e) {
    e = e.data();
    console.log(e);
    if (c.participant.participant_id !== e.participant_id) {
      return window.drawRemote(e);
    }
  });

}).call(this);
