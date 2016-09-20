var _ = require('lodash'),
    chai = require('./chai'),
    config = require('../../config'),
    expect = chai.expect,
    jwt = require('jsonwebtoken'),
    moment = require('moment');

exports.auth = function(body, data) {

  expect(body).to.be.an('object');
  expect(body).to.have.all.keys('token', 'user');

  var decoded;
  function decode() {
    decoded = jwt.decode(body.token, config.jwtSecret);
  }

  expect(body.token).to.be.a('string');
  expect(decode).not.to.throw();

  expect(decoded.sub).to.equal(data.user.apiId);

  expect(decoded.iat).to.be.a('number');
  if (data.issuedAfter) {
    expect(moment(decoded.iat)).to.be.afterMoment(moment(data.issuedAfter));
    expect(moment(decoded.iat)).to.be.beforeMoment(moment(data.issuedAfter).add(2, 'seconds'));
  }

  exports.user(body.user, data.user);
};

exports.check = function(body, data) {

  expect(body).to.be.an('object');

  var keys = [ 'id', 'title', 'interval', 'userId', 'createdAt', 'updatedAt' ];
  if (data.checkedAt) {
    keys.push('checkedAt');
  }

  expect(body).to.have.all.keys(keys);

  expect(body.id).to.be.a('string');
  expect(body.title).to.equal(data.title);
  expect(body.interval).to.equal(data.interval);
  expect(body.userId).to.equal(data.userId || (data.user.apiId ? data.user.apiId : data.user));

  if (data.checkedAt) {
    expect(body.checkedAt).to.be.sameMoment(data.checkedAt);
  }

  expect(body.createdAt).to.be.an.iso8601;
  if (data.createdAt) {
    expect(body.createdAt).to.be.sameMoment(data.createdAt);
  } else if (data.createdAfter) {
    expect(body.createdAt).to.be.afterMoment(data.createdAfter).and.be.beforeMoment(data.createdAfter.clone().add(2, 'seconds'));
    expect(body.updatedAt).to.equal(body.createdAt);
  }

  expect(body.updatedAt).to.be.an.iso8601;
  if (data.updatedAt) {
    expect(body.updatedAt).to.be.sameMoment(data.updatedAt);
  }
};

exports.user = function(body, data) {

  expect(body).to.be.an('object');
  expect(body).to.have.all.keys('id', 'email', 'role', 'createdAt', 'updatedAt');

  expect(body.id).to.be.a('string');
  expect(body.email).to.equal(data.email);
  expect(body.password).to.equal(undefined);
  expect(body.role).to.equal(data.role || 'user');

  expect(body.createdAt).to.be.an.iso8601;
  if (data.createdAt) {
    expect(body.createdAt).to.be.sameMoment(data.createdAt);
  } else if (data.createdAfter) {
    expect(body.createdAt).to.be.afterMoment(data.createdAfter).and.be.beforeMoment(data.createdAfter.clone().add(2, 'seconds'));
    expect(body.updatedAt).to.equal(body.createdAt);
  }

  expect(body.updatedAt).to.be.an.iso8601;
  if (data.updatedAt) {
    expect(body.updatedAt).to.be.sameMoment(data.updatedAt);
  }
};

_.each(exports, function(expectation, name) {
  exports[name + 'Factory'] = function() {
    var args = Array.prototype.slice.call(arguments);
    return function(res) {
      args.unshift(res.body);
      return exports[name].apply(exports, args);
    };
  };
});
