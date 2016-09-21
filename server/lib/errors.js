var config = require('../../config'),
    util = require('util');

var logger = config.logger('errors');

exports.handler = function(res) {
  return function(err) {

    var data = {},
        status = err.status || 500;

    if (err.name == 'ValidationError') {
      status = err.status || 422;
      data.errors = err.errors;
    } else {
      logger.warn(err);

      data.errors = [
        {
          message: err.message
        }
      ];
    }

    res.status(status).send(data);
  };
};

exports.catch404 = function(req, res, next) {
  next(new NotFoundError());
};

function ApiError(message, status) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.status = status;
};

util.inherits(ApiError, Error);

exports.ApiError = ApiError;

function NotFoundError(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message || 'Not Found';
  this.status = 404;
}

util.inherits(NotFoundError, Error);

exports.NotFoundError = NotFoundError;
