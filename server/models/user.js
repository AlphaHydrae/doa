var _ = require('lodash'),
    bcrypt = require('bcryptjs'),
    config = require('../../config'),
    mongoose = require('mongoose'),
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
  serialize: function() {
    return _.extend(_.pick(this, 'email', 'createdAt', 'role', 'updatedAt'), {
      id: this.apiId
    });
  }
};

module.exports = mongoose.model('User', UserSchema);
