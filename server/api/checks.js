var _ = require('lodash'),
    Check = require('../models/check'),
    express = require('express'),
    router = express.Router(),
    utils = require('./utils');

var checks = [
  { title: 'Foo bar baz' },
  { title: 'Qux corge grault' }
];

router.post('/', function(req, res, next) {

  var data = Check.parse(req.body);

  new Check(data).save().then(function(check) {
    res.json(check.serialize());
  }).catch(utils.errorHandler(res));
});

router.get('/', function(req, res, next) {
  Check.find().sort('createdAt').exec().then(function(checks) {
    res.json(_.invokeMap(checks, 'serialize'));
  }).catch(utils.errorHandler(res));
});

module.exports = router;
