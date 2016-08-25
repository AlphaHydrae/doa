var bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
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

      var token = jwt.sign({
        sub: user.apiId
      }, 'changeme');

      res.json({
        token: token,
        user: user.serialize()
      });
    });
  });
};
