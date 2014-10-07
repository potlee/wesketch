(function() {
  var tag;

  console.log("INIT COLLABRIFY FROM coffee");

  tag = prompt("Class: ");

  window.c = new CollabrifyClient({
    application_id: '4891981239025664',
    user_id: 'collabrify.tester@gmail.com'
  });

  c.createSession({
    name: 'potlee.wesketch31',
    tags: [tag],
    startPaused: false
  }).then(function(session) {
    console.log('CREATED: ', session);
    return initDraw();
  })["catch"](function(error) {
    return c.listSessions([tag]).then(function(sessions) {
      return c.joinSession({
        session: sessions[0]
      });
    }).then(function(session) {
      console.log('JOINED: ', session);
      return initDraw();
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
