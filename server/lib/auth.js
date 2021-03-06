var _ = require('lodash'),
    compose = require('composable-middleware'),
    config = require('../../config'),
    errors = require('./errors'),
    jwt = require('express-jwt'),
    p = require('bluebird'),
    User = require('../models/user');

var logger = config.logger('auth');

exports.authenticate = function(options) {

  options = _.defaults({}, options, {
    required: true
  });

  return compose()
    .use(enrichRequest)
    .use(validateJwt(options.required))
    .use(checkJwtError)
    .use(renameJwt)
    .use(loadAuthenticatedUser(options.required));
};

exports.authorize = function(policy, identifiedResource, options) {
  if (_.isObject(identifiedResource)) {
    options = identifiedResource;
    identifiedResource = false;
  }

  options = _.defaults({}, options, {
    required: false,
    identifiedResource: identifiedResource
  });

  return compose()
    .use(exports.authenticate(options))
    .use(function(req, res, next) {
      p.resolve().then(_.partial(policy, req)).then(function(authorized) {
        if (authorized) {
          next();
        } else {
          next(options.identifiedResource ? new errors.NotFoundError() : new errors.ApiError('You are not authorized to perform this action.', 403))
        }
      }).catch(next);
    });
};

function enrichRequest(req, res, next) {
  req.authenticated = function() {
    if (!req.user) {
      throw new errors.ApiError('Authentication required', 401);
    } else {
      return req.user;
    }
  };

  next();
}

function loadAuthenticatedUser(required) {
  return function(req, res, next) {
    if (!req.jwtToken) {
      return next();
    }

    User.findOne({ apiId: req.jwtToken.sub }, function(err, user) {
      if (err) {
        return next(err);
      } else if (required && !user) {
        return res.sendStatus(401);
      }

      if (user) {
        logger.debug('Authenticated with user ' + user.apiId);

        req.user = user;
      }

      next();
    });
  };
};

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
