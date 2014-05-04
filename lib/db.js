var _ = require('underscore'),
    moment = require('moment'),
    redis = require('redis'),
    slice = Array.prototype.slice;

var client = redis.createClient(),
    random = require('./random');

var DATES = [ 'createdAt', 'updatedAt', 'pingedAt' ];

function serializeWatch(watch) {

  watch = _.extend({}, watch, {
    interval: parseInt(watch.interval, 10),
    url: 'http://localhost:3000/' + watch.id
  });

  return serializeDates(watch);
}

function serializeDates(watch) {

  _.each(DATES, function(field) {
    if (watch[field]) {
      watch[field] = moment.unix(watch[field]).toISOString();
    }
  });

  return watch;
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
  watch.createdAt = moment().unix();
  watch.updatedAt = watch.createdAt;

  // TODO: atomic
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

  var key = 'doa:watch:' + id,
      now = moment().unix();

  client.hset(key, 'pingedAt', now, function(err) {
    if (err) {
      return callback(err);
    }

    callback(undefined, serializeDates({ id: id, pingedAt: now }));
  });
};

exports.updateWatch = function(watch, callback) {

  var key = 'doa:watch:' + watch.id,
      updates = _.omit(watch, 'id');

  if (_.isEmpty(updates)) {
    return callback();
  }

  updates.updatedAt = moment().unix();

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

        callback(undefined, serializeWatch(_.extend(existingWatch, watch)));
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
