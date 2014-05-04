var _ = require('underscore'),
    log4js = require('log4js'),
    redis = require('redis'),
    http = require('http'),
    q = require('q'),
    random = require('./random');

var app = require('../lib/app'),
    db = require('../lib/db'),
    debug = require('debug')('doa'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);

var sockets = [],
    logger = log4js.getLogger('doa');

var subscriber, publisher;
server.listen(app.get('port'), function() {

  subscriber = redis.createClient();
  subscriber.subscribe('doa:watches');

  publisher = redis.createClient();

  subscriber.on('message', function(channel, message) {

    message = JSON.parse(message);
    logger.trace('sub: channel ' + channel + ' received message ' + JSON.stringify(message));

    if (channel == 'doa:watches') {
      switch (message.name) {
        case 'created':
          _.invoke(sockets, 'emit', 'created', message.data);
          break;
        case 'updated':
          _.invoke(sockets, 'emit', 'updated', message.data);
          break;
        case 'deleted':
          _.invoke(sockets, 'emit', 'deleted', message.data);
          break;
        case 'pinged':
          _.invoke(sockets, 'emit', 'pinged', message.data);
          break;
      }
    }
  });

  logger.info('doa listening on port ' + server.address().port);
});

io.configure(function() {
  // TODO: configure `logger`, must supply a wrapper around log4js
  io.set('log level', 2);
});

io.sockets.on('connection', function(socket) {

  sockets.push(socket);

  var id = random.alphanum(12),
      logger = log4js.getLogger('client[' + id + ']');

  logger.debug('client connected');

  socket.on('init', function() {
    logger.debug('client requested initialization');

    db.getWatches(function(err, watches) {
      socket.emit('init', { watches: watches });
      logger.debug('initialization complete');
    });
  });

  socket.on('create', function(data) {

    data = _.pick(data, 'name', 'interval');
    logger.debug('client submitted watch for creation: ' + JSON.stringify(data));

    var watch = _.extend({
      interval: 86400
    }, data);

    if (!watch.name) {
      return socket.emit('create:error', { errors: [ { message: 'Name is required.' } ] });
    }

    db.createWatch(watch, function(err, createdWatch) {
      logger.info('watch ' + createdWatch.id + ' created (name: "' + createdWatch.name + '", interval: ' + createdWatch.interval + ')');
      publisher.publish('doa:watches', JSON.stringify({ name: 'created', data: createdWatch }));
    });
  });

  socket.on('update', function(data) {

    data = _.pick(data, 'id', 'name', 'interval');
    if (!data.id) {
      return socket.emit('update:error', { errors: [ { message: 'Id is required.' } ] });
    }

    logger.debug('client submitted watch for update: ' + JSON.stringify(data));

    db.updateWatch(data, function(err, updatedWatch) {
      if (err) {
        logger.warn('Failed to update watch: ' + err.message);
        return socket.emit('update:error', { errors: [ { message: err.message } ] });
      }

      logger.info('watch ' + updatedWatch.id + ' updated (name: "' + updatedWatch.name + '", interval: ' + updatedWatch.interval + ')');
      publisher.publish('doa:watches', JSON.stringify({ name: 'updated', data: updatedWatch }));
    });
  });

  socket.on('delete', function(id) {

    if (!id) {
      return socket.emit('delete:error', { errors: [ { message: 'Id is required.' } ] });
    }

    logger.debug('client requested deletion of watch ' + id);

    db.deleteWatch(id, function(err) {
      if (err) {
        logger.warn('failed to delete watch ' + id + ': ' + err.message);
        return socket.emit('delete:error', { errors: [ { message: err.message } ] });
      }

      logger.info('watch ' + id + ' deleted');
      publisher.publish('doa:watches', JSON.stringify({ name: 'deleted', data: id }));
    });
  });

  socket.on('disconnect', function() {
    sockets = _.without(sockets, socket);
    logger.debug('client disconnected');
  });
});

process.on('SIGINT', function() {

  var done = -2;
  function ender() {
    done += 1;
    if (done) {
      console.log('Successfully closed all connections');
      process.exit(0);
    }
  }

  q.nfcall(_.bind(server.close, server)).fin(function() {
    subscriber.on('end', ender);
    publisher.on('end', ender);
    subscriber.quit();
    publisher.quit();
  });
});
