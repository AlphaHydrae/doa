var _ = require('underscore'),
    crypto = require('crypto');

var ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyz0123456789';

exports.alphanum = function(n) {

  var bytes = crypto.randomBytes(n),
      result = new Array(n),
      length = ALPHANUMERIC.length;

  _.times(n, function(i) {
    result[i] = ALPHANUMERIC[bytes[i] % length];
  });

  return result.join('');
};
