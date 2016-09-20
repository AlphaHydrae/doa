var _ = require('../../../lib/lodash'),
    expectations = require('../../spec/expectations'),
    fixtures = require('../../spec/fixtures'),
    p = require('bluebird'),
    spec = require('../../spec/utils');

describe('POST /api/auth', function() {

  var state,
      data = {};

  beforeEach(function() {

    data.passwords = {
      user: 'changeme',
      admin: 'letmein'
    };

    return state = spec.setUp(function() {
      return p.all([
        fixtures.create('user', { password: data.passwords.user }),
        fixtures.create('admin', { password: data.passwords.admin })
      ]);
    });
  });

  it('should authenticate a user', function(done) {

    var authData = {
      email: fixtures.get('user').email,
      password: data.passwords.user
    };

    var expected = {
      issuedAfter: state.now,
      user: fixtures.get('user')
    };

    spec
      .testApi('POST', '/api/auth', authData)
      .expect(expectations.authFactory(expected))
      .end(done);
  });

  it('should authenticate an admin', function(done) {

    var authData = {
      email: fixtures.get('admin').email,
      password: data.passwords.admin
    };

    var expected = {
      issuedAfter: state.now,
      user: fixtures.get('admin')
    };

    spec
      .testApi('POST', '/api/auth', authData)
      .expect(expectations.authFactory(expected))
      .end(done);
  });

  // Failed authentication
  it('should not authenticate a blank request', spec.testErrorFactory('POST', '/api/auth', {}, null, 401));
  it('should not authenticate an unknown user', spec.testErrorFactory('POST', '/api/auth', function() { return { email: 'unknown@example.com', password: data.passwords.user }; }, null, 401));
  it('should not authenticate an invalid password', spec.testErrorFactory('POST', '/api/auth', function() { return { email: fixtures.get('user').email, password: 'yeehaw' }; }, null, 401));
});
