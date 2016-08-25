var _ = require('lodash'),
    mongoose = require('mongoose'),
    mongooseInteger = require('mongoose-integer'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp'),
    uuid = require('uuid');

var CheckSchema = new Schema({
  apiId: { type: String, unique: true },
  title: { type: String, required: true, maxlength: 50, unique: true },
  interval: { type: Number, required: true, integer: true, min: 1 },
  checkedAt: { type: Date }
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
      id: this.apiId
    });
  }
};

module.exports = mongoose.model('Check', CheckSchema);
