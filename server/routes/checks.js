var express = require('express'),
    router = express.Router();

var checks = [
  { title: 'Foo bar baz' },
  { title: 'Qux corge grault' }
];

router.post('/', function(req, res, next) {
  checks.push(req.body);
  res.json(req.body);
});

router.get('/', function(req, res, next) {
  res.json(checks);
});

module.exports = router;
