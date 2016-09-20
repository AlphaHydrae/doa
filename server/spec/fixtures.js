var _ = require('lodash');

var Check = require('../models/check'),
    User = require('../models/user');

var emailNumber = 1,
    checkTitleNumber = 1;

var fixtures = {};

exports.create = function(name, fixture, data) {

  if (_.isObject(fixture) || fixture === undefined) {
    data = fixture;
    fixture = name;
  }

  if (!exports[fixture]) {
    throw new Error('No ' + fixture + ' fixture is defined');
  }

  return exports[fixture](_.extend({}, data)).then(function(created) {
    fixtures[name] = created;
    return created;
  });
};

exports.get = function(name) {
  if (!fixtures[name]) {
    throw new Error('No fixture named ' + name + ' has been created');
  }

  return fixtures[name];
};

exports.check = function(data) {
  return new Check({
    title: data.title || nextCheckTitle(),
    interval: data.interval || 5,
    checkedAt: data.checkedAt,
    user: data.user || data.userId
  }).save();
};

exports.user = function(data) {
  return new User({
    email: data.email || nextEmail(),
    password: data.password || 'changeme',
    role: data.role
  }).save();
};

exports.admin = function(data) {
  return exports.user(_.extend(data, {
    role: 'admin'
  }));
};

function nextEmail() {
  return 'user-' + (emailNumber++) + '@example.com';
}

function nextCheckTitle() {
  return 'Title ' + (checkTitleNumber++);
}
