(function() {
  var tag;

  console.log("INIT COLLABRIFY FROM coffee");

  tag = 'deepj';

  document.getElementById('go').onclick = function() {
    document.getElementById('welcome-screen').classList.add('hidden');
    spinner.spin(document.body);
    tag = document.getElementById('sketch-name').value;
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
      spinner.stop();
      return initDraw();
    })["catch"](function(error) {
      return c.listSessions([tag]).then(function(sessions) {
        return c.joinSession({
          session: sessions[0]
        });
      }).then(function(session) {
        console.log('JOINED: ', session);
        spinner.stop();
        return initDraw();
      })["catch"](console.log);
    });
    return c.on('event', function(e) {
      e = e.data();
      if (c.participant.participant_id !== e.participant_id) {
        return window.drawRemote(e);
      }
    });
  };

}).call(this);
