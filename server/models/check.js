var _ = require('lodash'),
    mongoose = require('mongoose'),
    mongooseInteger = require('mongoose-integer'),
    policy = require('../lib/policy'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp'),
    uuid = require('uuid');

var CheckSchema = new Schema({
  apiId: { type: String, unique: true },
  title: { type: String, required: true, maxlength: 50, unique: true },
  interval: { type: Number, required: true, integer: true, min: 1 },
  checkedAt: { type: Date },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

CheckSchema.plugin(timestamps);
CheckSchema.plugin(mongooseInteger);

CheckSchema.pre('save', function(next) {
  if (this.isNew) {
    this.apiId = uuid.v4();
  }

  next();
});

CheckSchema.statics = {
  parse: function(body) {
    return _.pick(body, 'title', 'interval');
  }
};

CheckSchema.methods = {
  serialize: function() {
    return _.extend(_.pick(this, 'title', 'interval', 'checkedAt', 'createdAt', 'updatedAt'), {
      id: this.apiId,
      userId: this.user.apiId
    });
  }
};

var model = module.exports = mongoose.model('Check', CheckSchema);

policy(model, {
  index: function(req) {
    return true;
  },

  create: function(req) {
    return req.authenticated();
  },

  retrieve: function(req) {
    return req.authenticated() && (req.user.hasRole('admin') || (req.user._id.equals(req.record.user) || req.user._id.equals(req.record.user._id)));
  },

  ping: function(req) {
    return req.authenticated();
  },

  destroy: function(req) {
    return req.authenticated();
  },

  scope: function(req, options) {
    options = _.extend({}, options);
    var query = options.query || this.find();
    return req.user ? query.where('user', req.user._id) : query.where({ _id: null });
  }
});
