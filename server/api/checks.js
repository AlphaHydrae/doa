var _ = require('lodash'),
    Check = require('../models/check'),
    express = require('express'),
    router = express.Router(),
    utils = require('./utils');

var checks = [
  { title: 'Foo bar baz' },
  { title: 'Qux corge grault' }
];

router.post('/', function(req, res) {

  var data = Check.parse(req.body);

  new Check(data).save().then(function(check) {
    res.json(check.serialize());
  }).catch(utils.errorHandler(res));
});

router.get('/', function(req, res) {
  Check.find().sort('createdAt').exec().then(function(checks) {
    res.json(_.invokeMap(checks, 'serialize'));
  }).catch(utils.errorHandler(res));
});

router.delete('/:id', fetchCheck, function(req, res) {
  req.record.remove().then(function() {
    res.sendStatus(204);
  }).catch(utils.errorHandler(res));
});

function fetchCheck(req, res, next) {
  Check.findOne()
    .where('apiId').equals(req.params.id)
    .exec().then(function(check) {
      if (!check) {
        return res.sendStatus(404);
      }

      req.record = check;
      next();
    });
}

module.exports = router;
