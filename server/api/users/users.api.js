var _ = require('lodash'),
    errors = require('../../lib/errors'),
    pagination = require('../../lib/pagination'),
    User = require('../../models/user');

/**
 * POST /api/users
 */
exports.create = function(req, res) {

  var data = User.parse(req.body);

  new User(data).save().then(function(check) {
    res.status(201).json(check.serialize());
  }).catch(errors.handler(res));
};
