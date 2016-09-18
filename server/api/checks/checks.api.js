var _ = require('lodash'),
    Check = require('../../models/check'),
    errors = require('../../lib/errors'),
    pagination = require('../../lib/pagination'),
    utils = require('../utils');

/**
 * POST /api/checks
 */
exports.create = function(req, res) {

  var data = Check.parse(req.body),
      record = new Check(data);

  record.user = req.user;

  record.save().then(function(check) {
    res.json(check.serialize());
  }).catch(errors.handler(res));
};

/**
 * GET /api/checks
 */
exports.index = function(req, res) {

  var query = Check.policy.scope(req)
    .sort('createdAt')
    .populate('user');

  function filter(query) {

    if (req.query.title) {
      query = query.where('title').eq(req.query.title);
    }

    return query;
  }

  pagination(req, res, query, filter).then(function(checks) {
    res.json(_.invokeMap(checks, 'serialize'));
  }).catch(errors.handler(res));
};

/**
 * GET /api/checks/:id
 */
exports.retrieve = function(req, res) {
  res.json(req.record.serialize());
};

/**
 * POST /api/checks/:id/ping
 */
exports.ping = function(req, res) {

  var now = new Date();

  var updates = {
    checkedAt: now
  };

  Check.update({ _id: req.record.id }, { $set: updates }).exec().then(function() {
    res.json({
      checkId: req.record.apiId,
      createdAt: now
    });
  }).catch(errors.handler(res));
};

/**
 * DELETE /api/checks/:id
 */
exports.destroy = function(req, res) {
  req.record.remove().then(function() {
    res.sendStatus(204);
  }).catch(errors.handler(res));
};

exports.fetchRecord = _.partial(utils.fetchRecord, function findRecord(id) {
  return Check
    .findOne()
    .where('apiId').equals(id)
    .populate('user')
    .exec();
});
