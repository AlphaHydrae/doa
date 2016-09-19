var config = require('../../config'),
    util = require('util');

var logger = config.logger('errors');

exports.handler = function(res) {
  return function(err) {

    var data = {};
    if (err.name == 'ValidationError') {
      data.errors = err.errors;
    } else {
      logger.warn(err);

      data.errors = [
        {
          message: err.message
        }
      ];
    }

    res.status(500).send(data);
  };
};

function ApiError(message, status) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.status = status;
};

util.inherits(ApiError, Error);

exports.ApiError = ApiError;
