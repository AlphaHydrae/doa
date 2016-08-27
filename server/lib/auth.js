var _ = require('lodash'),
    compose = require('composable-middleware'),
    config = require('../../config'),
    jwt = require('express-jwt'),
    log4js = require('log4js'),
    User = require('../models/user');

var logger = log4js.getLogger('auth');

exports.authenticate = function(options) {
  options = _.extend({}, options);

  var required = !!_.get(options, 'required', true);

  return compose()
    .use(validateJwt(required))
    .use(checkJwtError)
    .use(renameJwt)
    .use(loadAuthenticatedUser);
};

exports.requireRole = function(role) {
  return function(req, res, next) {
  };
};

function loadAuthenticatedUser(req, res, next) {
  if (!req.jwtToken) {
    return next();
  }

  User.findOne({ apiId: req.jwtToken.sub }, function(err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.sendStatus(401);
    }

    logger.debug('Authenticated with user ' + user.apiId);
    req.user = user;
    next();
  });
}

function renameJwt(req, res, next) {
  if (_.has(req, 'user')) {
    req.jwtToken = req.user;
    delete req.user;
  }

  next();
}

function validateJwt(credentialsRequired) {
  return jwt({
    credentialsRequired: credentialsRequired,
    secret: config.jwtSecret
  });
}

function checkJwtError(err, req, res, next) {
  if (err) {
    return res.status(401)
      .type('text/plain')
      .send(err.name == 'UnauthorizedError' ? err.message : 'Your authentication credentials are invalid');
  }

  next();
}
