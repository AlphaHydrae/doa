var db = require('../lib/db'),
    express = require('express'),
    redis = require('redis');

var client = redis.createClient(),
    router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'doa' });
});

router.post(/^\/([a-z0-9]{5})$/, function(req, res) {

  var id = req.params[0];
  db.pingWatch(id, function(err, updates) {
    if (err) {
      return res.json(500, err.message);
    }

    client.publish('doa:watches', JSON.stringify({ name: 'pinged', data: updates }));

    res.send(204);
  });
});

module.exports = router;
