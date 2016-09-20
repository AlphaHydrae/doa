var chai = require('chai'),
    moment = require('moment');

chai.use(require('chai-moment'));

chai.use(function(chai, utils) {

  var Assertion = chai.Assertion;

  Assertion.addProperty('iso8601', function() {
    this.assert(moment(this._obj).isValid(), 'expected #{this} to be a valid ISO-8601 date string', 'expected #{this} not to be a valid ISO-8601 date string');
  });
});

module.exports = chai;
