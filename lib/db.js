var _ = require('underscore'),
    redis = require('redis');

var client = redis.createClient(),
    random = require('./random');

function serializeWatch(watch) {
  return _.extend(watch, {
    interval: parseInt(watch.interval, 10),
    url: 'http://localhost:3000/' + watch.id
  });
}

exports.getWatches = function(callback) {
  client.lrange('doa:watches:list', 0, -1, function(err, list) {
    if (err) {
      return callback(err);
    }

    var multi = client.multi();
    _.each(list, function(id) {
      multi.hgetall('doa:watch:' + id);
    });

    multi.exec(function(err, watches) {
      if (err) {
        return callback(err);
      }

      callback(undefined, _.map(watches, serializeWatch));
    });
  });
};

exports.createWatch = function(watch, callback) {

  // TODO: check uniqueness
  watch.id = random.alphanum(5);

  client.lpush('doa:watches:list', watch.id, function(err) {
    if (err) {
      return callback(err);
    }

    client.hmset('doa:watch:' + watch.id, watch, function(err) {
      if (err) {
        return callback(err);
      }

      callback(undefined, serializeWatch(watch));
    });
  });
};

exports.pingWatch = function(id, callback) {

  var key = 'doa:watch:' + id;

  client.hset(key, 'status', 'up', function(err) {
    if (err) {
      return callback(err);
    }

    callback(undefined, { id: id, status: 'up' });
  });
};

exports.updateWatch = function(watch, callback) {

  var key = 'doa:watch:' + watch.id,
      updates = _.omit(watch, 'id');

  if (_.isEmpty(updates)) {
    return callback();
  }

  // TODO: retry once if failed
  client.watch(key, function(err) {
    if (err) {
      return callback(err);
    }

    client.hgetall(key, function(err, existingWatch) {
      if (err) {
        return callback(err);
      } else if (!existingWatch) {
        return callback(new Error('No such watch ' + watch.id));
      }

      var multi = client.multi();
      multi.hmset(key, updates);

      multi.exec(function(err) {
        if (err) {
          return callback(err);
        }

        callback(undefined, _.extend(existingWatch, watch));
      });
    });
  });
};

exports.deleteWatch = function(id, callback) {

  var multi = client.multi();
  multi.del('doa:watch:' + id);
  multi.lrem('doa:watches:list', 0, id);

  multi.exec(function(err) {
    if (err) {
      return callback(err);
    }

    callback();
  });
};

exports.deleteWatches = function(callback) {

  client.lrange('doa:watches:list', 0, -1, function(err, list) {
    if (err) {
      return callback(err);
    }

    var multi = client.multi();
    _.each(list, function(id) {
      multi.del('doa:watch:' + id);
      multi.lrem('doa:watches:list', 0, id);
    });

    multi.exec(function(err) {
      if (err) {
        return callback(err);
      }

      callback();
    });
  });
};
