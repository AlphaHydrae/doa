var _ = require('../../../lib/lodash'),
    expectations = require('../../spec/expectations'),
    fixtures = require('../../spec/fixtures'),
    p = require('bluebird'),
    spec = require('../../spec/utils');

describe('POST /api/users', function() {

  var state,
      data = {};

  beforeEach(function() {

    data.user = {
      email: 'user@example.com',
      password: 'foobar'
    };

    return state = spec.setUp(function() {
      return p.all([
        fixtures.create('user'),
        fixtures.create('admin')
      ]);
    });
  });

  it('should create a user', function(done) {

    var expected = _.extend(data.user, {
      createdAfter: state.now
    });

    spec
      .testCreate('/api/users', data.user, fixtures.get('admin'))
      .expect(expectations.userFactory(expected))
      .end(done);
  });

  it('should create an admin', function(done) {

    data.user.role = 'admin';

    var expected = _.extend(data.user, {
      createdAfter: state.now
    });

    spec
      .testCreate('/api/users', data.user, fixtures.get('admin'))
      .expect(expectations.userFactory(expected))
      .end(done);
  });

  // Validations
  it('should not create a blank user', spec.testErrorFactory('POST', '/api/users', {}, _.invoker(fixtures, 'get', 'admin'), 422));
  it('should not create an invalid user', spec.testErrorFactory('POST', '/api/users', { email: 'user-1@example.com', password: '123' }, _.invoker(fixtures, 'get', 'admin'), 422));

  // Authorization
  it('should deny access to an anonymous user', spec.testErrorFactory('POST', '/api/users', _.getter(data, 'user'), null, 401));
  it('should deny access to a non-admin', spec.testErrorFactory('POST', '/api/users', _.getter(data, 'user'), _.invoker(fixtures, 'get', 'user'), 403));
});
