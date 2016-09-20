var _ = require('lodash');

var binders = {
  'get': 'getter',
  'invoke': 'invoker'
};

_.each(binders, function(newFunc, oldFunc) {
  _[newFunc] = function() {
    var args = Array.prototype.slice.call(arguments);
    return function() {
      return _[oldFunc].apply(_, args);
    };
  };
});

module.exports = _;
