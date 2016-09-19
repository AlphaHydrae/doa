var _ = require('../../../lib/lodash'),
    expectations = require('../../spec/expectations'),
    fixtures = require('../../spec/fixtures'),
    p = require('bluebird'),
    spec = require('../../spec/utils');

describe('/api/users', function() {
  describe('POST', function() {

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

    it('should forbid access to a non-admin', spec.testCreateForbiddenFactory('/api/users', _.getter(data, 'user'), _.invoker(fixtures, 'get', 'user')));

    it('should create a user', function(done) {
      spec
        .testCreate('/api/users', data.user, fixtures.get('admin'))
        .expect(expectations.user(_.extend(data.user, {
            createdAfter: state.now
        })))
        .end(done);
    });

    it('should create an admin', function(done) {
      data.user.role = 'admin';
      spec
        .testCreate('/api/users', data.user, fixtures.get('admin'))
        .expect(expectations.user(_.extend(data.user, {
            createdAfter: state.now
        })))
        .end(done);
    });
  });
});
