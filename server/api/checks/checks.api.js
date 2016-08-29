var _ = require('lodash'),
    Check = require('../../models/check'),
    errors = require('../../lib/errors'),
    pagination = require('../../lib/pagination');

/**
 * POST /api/checks
 */
exports.create = function(req, res) {

  var data = Check.parse(req.body);

  new Check(data).save().then(function(check) {
    res.json(check.serialize());
  }).catch(errors.handler(res));
};

/**
 * GET /api/checks
 */
exports.retrieveAll = function(req, res) {

  var query = Check.find().sort('createdAt')

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

exports.fetchRecord = function(req, res, next) {
  Check
    .findOne()
    .where('apiId').equals(req.params.id)
    .exec().then(function(check) {
      if (!check) {
        return res.sendStatus(404);
      }

      req.record = check;
      next();
    });
};
