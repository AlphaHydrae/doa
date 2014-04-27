var _ = require('underscore'),
    redis = require('redis');

var client = redis.createClient(),
    random = require('./random');

function serializeWatch(watch) {
  return _.extend(watch, {
    url: 'http://localhost:3000/watches/' + watch.id
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
