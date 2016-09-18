var bcrypt = require('bcryptjs'),
    config = require('../../../config'),
    User = require('../../models/user');

exports.authenticate = function(req, res) {

  var email = req.body.email,
      password = req.body.password;

  User.findOne().where('email').equals(email).exec().then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }

    bcrypt.compareAsync(password, user.passwordHash).then(function(matches) {
      if (!matches) {
        return res.sendStatus(401);
      }

      res.json({
        token: user.jwt(),
        user: user.serialize()
      });
    });
  });
};
