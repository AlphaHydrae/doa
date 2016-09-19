var chai = require('./chai'),
    expect = chai.expect;

exports.user = function(data) {
  return function(res) {

    var body = res.body;
    expect(body).to.be.an('object');
    expect(body).to.have.all.keys('id', 'email', 'role', 'createdAt', 'updatedAt');

    expect(body.id).to.be.a('string');
    expect(body.email).to.equal(data.email);
    expect(body.password).to.equal(undefined);
    expect(body.role).to.equal(data.role || 'user');

    if (data.createdAt) {
      expect(body.createdAt).to.be.sameMoment(data.createdAt);
    }

    if (data.updatedAt) {
      expect(body.updatedAt).to.be.sameMoment(data.updatedAt);
    }

    if (data.createdAfter) {
      expect(body.createdAt).to.be.afterMoment(data.createdAfter).and.be.beforeMoment(data.createdAfter.clone().add(2, 'seconds'));
      expect(body.updatedAt).to.equal(body.createdAt);
    }
  };
};
