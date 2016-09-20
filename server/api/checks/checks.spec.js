var _ = require('../../../lib/lodash'),
    expectations = require('../../spec/expectations'),
    fixtures = require('../../spec/fixtures'),
    p = require('bluebird'),
    spec = require('../../spec/utils');

describe('POST /api/checks', function() {

  var state,
      data = {};

  beforeEach(function() {

    data.check = {
      title: 'Something that should work',
      interval: 5
    };

    return state = spec.setUp(function() {
      return p.all([
        fixtures.create('user')
      ]);
    });
  });

  it('should create a check', function(done) {

    var expected = _.extend(data.check, {
      createdAfter: state.now,
      user: fixtures.get('user')
    });

    spec
      .testCreate('/api/checks', data.check, fixtures.get('user'))
      .expect(expectations.checkFactory(expected))
      .end(done);
  });

  // Validations
  it('should not create a blank check', spec.testErrorFactory('POST', '/api/checks', {}, _.invoker(fixtures, 'get', 'user'), 422));
  it('should not create an invalid check', spec.testErrorFactory('POST', '/api/checks', { title: '', interval: 0 }, _.invoker(fixtures, 'get', 'user'), 422));

  // Authorization
  it('should deny access to an anonymous user', spec.testErrorFactory('POST', '/api/checks', _.getter(data, 'check'), null, 401));
});

describe('GET /api/checks/:id', function() {

  var check,
      state;

  beforeEach(function() {
    return state = spec.setUp(function() {
      return fixtures.create('user').then(function(user) {
        return fixtures.create('check', {
          user: user
        });
      }).then(function(record) {
        check = record;
      });
    });
  });

  it('should retrieve a check', function(done) {
    spec
      .testApi('GET', '/api/checks/' + check.apiId, null, fixtures.get('user'))
      .expect(expectations.checkFactory(fixtures.get('check')))
      .end(done);
  });

  // Authorization
  it('should deny access to an anonymous user', spec.testErrorFactory('GET', function() { return '/api/checks/' + fixtures.get('check').apiId; }, null, null, 401));
});
