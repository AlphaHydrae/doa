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

exports.testApi = function(method, path, data, headers) {

  var request = exports
    .testApp()[method.toLowerCase()](_.isFunction(path) ? path() : path);

  if (data) {
    request = request.send(_.isFunction(data) ? data() : data);
  }

  headers = _.isFunction(headers) ? headers() : headers;

  if (headers instanceof User) {
    headers = {
      Authorization: 'Bearer ' + headers.jwt()
    };
  }

  if (headers) {
    _.each(headers, function(value, key) {
      request = request.set(key, value);
    });
  }

  return request;
};

exports.testCreate = function(path, data, user) {

  var request = exports
    .testApi('POST', path, data)
    .expect(201);

  if (user) {
    user = _.isFunction(user) ? user() : user;
    request = request.set('Authorization', 'Bearer ' + user.jwt());
  }

  return request;
};

exports.testError = function(method, path, data, user, expectedStatus) {

  var request = exports
    .testApi(method, path, data, user)
    .expect(expectedStatus);

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
