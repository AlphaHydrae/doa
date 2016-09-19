var _ = require('lodash');

_.getter = function(object) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    return _.get.apply(_, args);
  };
};

_.invoker = function(object, path) {
  var args = Array.prototype.slice.call(arguments, 2);
  return function() {
    return _.invoke(object, path, args);
  };
};

module.exports = _;
