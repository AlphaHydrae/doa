var _ = require('underscore'),
    express = require('express'),
    redis = require('redis');

var client = redis.createClient(),
    random = require('../lib/random'),
    router = express.Router();

function serializeWatch(watch) {
  return _.extend(watch, {
    url: 'http://localhost:3000/watches/' + watch.id
  });
}

router.get('/', function(req, res) {

  client.lrange('doa:watches:list', 0, -1, function(err, list) {

    var multi = client.multi();
    _.each(list, function(id) {
      multi.hgetall('doa:watch:' + id);
    });

    multi.exec(function(err, watches) {
      res.json(_.map(watches, serializeWatch));
    });
  });
});

router.post('/', function(req, res) {

  var watch = _.extend({
    interval: 86400
  }, _.pick(req.body, 'name', 'interval'), {
    status: 'new'
  });

  if (!watch.name) {
    return res.json(422, { errors: [ { message: 'Name is required.' } ] });
  }

  // TODO: check uniqueness
  watch.id = random.alphanum(5);

  client.lpush('doa:watches:list', watch.id, function(err) {
    client.hmset('doa:watch:' + watch.id, watch, function(err) {
      res.json(serializeWatch(watch));
    });
  });
});

// TODO: expose only if configured
router.delete('/', function(req, res) {

  client.lrange('doa:watches:list', 0, -1, function(err, list) {

    var multi = client.multi();
    _.each(list, function(id) {
      multi.del('doa:watch:' + id);
      multi.lrem('doa:watches:list', 0, id);
    });

    multi.exec(function(err) {
      res.send(204);
    });
  });
});

module.exports = router;
