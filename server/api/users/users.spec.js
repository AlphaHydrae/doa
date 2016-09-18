var app = require('../../app'),
    chai = require('chai'),
    expect = chai.expect,
    moment = require('moment'),
    p = require('bluebird'),
    supertest = require('supertest');

var Check = require('../../models/check'),
    User = require('../../models/user');

chai.use(require('chai-moment'));

describe('/api/users', function() {
  describe('POST', function() {

    var admin,
        now,
        later;

    beforeEach(function() {
      return p.resolve().then(clearDatabase).then(createAdmin).then(function(record) {
        admin = record;
        now = moment();
        later = moment().add(2, 'seconds');
      });
    });

    it('should create a user', function(done) {
      supertest(app)
        .post('/api/users')
        .set('Authorization', 'Bearer ' + admin.jwt())
        .send({
          email: 'user@example.com',
          password: 'foobar'
        })
        .expect(201)
        .expect(function(res) {

          var body = res.body;
          expect(body).to.be.an('object');
          expect(body).to.have.all.keys('id', 'email', 'role', 'createdAt', 'updatedAt');

          expect(body.id).to.be.a('string');
          expect(body.email).to.equal('user@example.com');
          expect(body.password).to.equal(undefined);

          expect(body.createdAt)
            .to.be.afterMoment(now)
            .and.be.beforeMoment(later);

          expect(body.updatedAt).to.equal(body.createdAt);
        })
        .end(done);
    });
  });
});

function clearDatabase() {
  return p.all([
    Check.remove({}),
    User.remove({})
  ]);
}

function createAdmin() {
  return new User({
    email: 'admin@example.com',
    password: 'foobar',
    role: 'admin'
  }).save();
}
