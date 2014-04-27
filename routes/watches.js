var _ = require('underscore'),
    express = require('express');

var db = require('../lib/db'),
    random = require('../lib/random'),
    router = express.Router();

router.get('/', function(req, res) {
  db.getWatches(function(err, watches) {
    res.json(watches);
  });
});

// TODO: expose only if configured
router.delete('/', function(req, res) {
  db.deleteWatches(function(err) {
    res.send(204);
  });
});

module.exports = router;
