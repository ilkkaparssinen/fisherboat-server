var express = require('express');
var app = express();
var path = require('path');
var ws_controller = require("./controllers/ws_controller");
var cookieParser = require('cookie-parser');

app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws_controller.connection(ws);
});

// error handlers


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.use(cookieParser());
var favicon = require('serve-favicon');

var server = app.listen(3002, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Web content server listening at http://%s:%s', host, port);
});

