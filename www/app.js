var http = require('http'),
fs = require('fs')
var port = process.env.PORT || 80
http.createServer(function(req, res) {
  var url = './www/' + (req.url == '/' ? 'index.html' : req.url)
  fs.readFile(url, function(err, html) {
    if (err) {
      var message404 = "There is no such page! <a href='/'>Back to home page</a>"
        res.writeHead(404, {'Content-Type': 'text/html', 'Content-Length': message404.length})

      res.write(message404)
    } else {
      if(url.indexOf('.css') == -1)
        res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': html.length})
      if(url.indexOf('.svg') == -1)
        res.writeHead(200, {'Content-Type': 'image/svg+xml', 'Content-Length': html.length})
      else
        res.writeHead(200, {'Content-Type': 'text/css', 'Content-Length': html.length})
      res.write(html)
    }
    res.end()
  })
}).listen(port)
