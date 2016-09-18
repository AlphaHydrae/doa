var _ = require('lodash'),
    bcrypt = require('bcryptjs'),
    config = require('../../config'),
    jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    policy = require('../lib/policy'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp'),
    uuid = require('uuid'),
    validator = require('validator');

var roles = [ 'user', 'admin' ];

var UserSchema = new Schema({
  apiId: { type: String, unique: true },
  email: { type: String, required: true, maxlength: 50, unique: true },
  passwordHash: { type: String, default: null },
  role: { type: String, required: true, enum: roles, default: [ 'user' ] }
});

UserSchema
  .virtual('password')
  .set(function(password) {

    this._password = password;

    if (password && password.length) {
      var salt = bcrypt.genSaltSync(config.bcryptCost);
      this.passwordHash = bcrypt.hashSync(password, salt);
    } else {
      this.passwordHash = null;
    }
  })
  .get(function() {
    return this._password;
  });

UserSchema.path('passwordHash').validate(function(value) {
  if (this._password) {
    if (!validator.isLength(this._password, { min: 6 })) {
      this.invalidate('password', 'Password must be at least 6 characters');
    }
  } else if (this.isNew) {
    this.invalidate('password', 'Password is required');
  }
}, null);

UserSchema.plugin(timestamps);

UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.apiId = uuid.v4();
  }

  next();
});

UserSchema.statics = {
  parse: function(body) {
    return _.pick(body, 'email', 'password', 'role');
  }
};

UserSchema.methods = {
  jwt: function() {
    return jwt.sign({
      sub: this.apiId
    }, config.jwtSecret);
  },

  hasRole: function(role) {
    return this.role == role;
  },

  serialize: function() {
    return _.extend(_.pick(this, 'email', 'role', 'createdAt', 'updatedAt'), {
      id: this.apiId
    });
  }
};

var model = module.exports = mongoose.model('User', UserSchema);

policy(model, {
  create: function(req) {
    return req.authenticated().hasRole('admin');
  }
});
