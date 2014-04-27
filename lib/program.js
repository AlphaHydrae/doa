var _ = require('underscore'),
    http = require('http');

var app = require('../lib/app'),
    db = require('../lib/db'),
    debug = require('debug')('doa'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

io.sockets.on('connection', function (socket) {

  socket.on('init', function() {
    db.getWatches(function(err, watches) {
      socket.emit('init', { watches: watches });
    });
  });

  socket.on('create', function(data) {

    var watch = _.extend({
      interval: 86400
    }, _.pick(data, 'name', 'interval'), {
      status: 'new'
    });

    if (!watch.name) {
      return socket.emit('create:error', { errors: [ { message: 'Name is required.' } ] });
    }

    db.createWatch(watch, function(err, createdWatch) {
      socket.emit('created', createdWatch);
    });
  });
});
