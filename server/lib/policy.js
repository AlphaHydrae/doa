var _ = require('lodash');

module.exports = function(model, policy) {
  model.policy = {};
  _.each(policy, function(value, key) {
    model.policy[key] = _.bind(value, model);
  });
};
