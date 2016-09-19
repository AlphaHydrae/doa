var _ = require('lodash'),
    app = require('../app'),
    moment = require('moment'),
    p = require('bluebird'),
    supertest = require('supertest');

var Check = require('../models/check'),
    User = require('../models/user');

exports.clearDatabase = function() {
  return p.all([
    Check.remove({}),
    User.remove({})
  ]);
};

exports.testApp = function() {
  return supertest(app);
};

exports.testCreate = function(path, data, user) {

  var request = exports.testApp()
    .post(path)
    .send(data)
    .expect(201);

  if (user) {
    user = _.isFunction(user) ? user() : user;
    request = request.set('Authorization', 'Bearer ' + user.jwt());
  }

  return request;
};

exports.testCreateForbidden = function(path, data, user) {

  var request = exports.testApp()
    .post(path)
    .send(_.isFunction(data) ? data() : data)
    .expect(403);

  if (user) {
    user = _.isFunction(user) ? user() : user;
    request = request.set('Authorization', 'Bearer ' + user.jwt());
  }

  return request;
};

_.each(exports, function(value, key) {
  if (key.match('^test[A-Z]')) {
    exports[key + 'Factory'] = function() {
      var args = Array.prototype.slice.call(arguments);
      return function(done) {
        exports[key].apply(exports, args).end(done);
      };
    };
  }
});

exports.setUp = function(createData) {

  var state = {};

  state.promise = p.resolve().then(exports.clearDatabase).then(createData || _.noop).then(function(data) {
    state.now = moment();
    return data;
  });

  state.then = _.bind(state.promise.then, state.promise);

  return state;
};
