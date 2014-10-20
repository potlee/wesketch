console.log("INIT COLLABRIFY FROM coffee");

window.wsCanvas = new WSCanvas;

document.getElementById('go').onclick = function() {
  var tag;
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
    return spinner.stop();
  })["catch"](function(error) {
    return c.listSessions([tag]).then(function(sessions) {
      return c.joinSession({
        session: sessions[0]
      });
    }).then(function(session) {
      return console.log('JOINED: ', session);
    });
  }).then(function() {
    spinner.stop();
    return wsCanvas.fitToScreen();
  })["catch"](console.log);
  return c.on('event', function(e) {
    console.log(e);
    e = e.data();
    wsCanvas.strokes.push(e);
    return wsCanvas.drawStroke(e);
  });
};
