var express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
  res.json([
    { title: 'Foo bar baz' },
    { title: 'Qux corge grault' }
  ]);
});

module.exports = router;
