var _ = require('lodash'),
    env = process.env.NODE_ENV || 'development',
    path = require('path');

var pkg = require(path.join('..', 'package')),
    root = path.normalize(path.join(__dirname, '..'));

var liveReloadPort = process.env.LIVERELOAD_PORT || 35729;

var config = {
  all: {
    port: process.env.PORT || 3000
  },

  development: {
    db: process.env.DOA_MONGODB_URI || 'mongodb://localhost/doa',
    liveReloadUrl: process.env.LIVERELOAD_URL || 'http://localhost:' + liveReloadPort + '/livereload.js'
  },

  test: {
    db: process.env.DOA_MONGODB_URI || 'mongodb://localhost/doa-test',
  },

  production: {
    db: process.env.DOA_MONGODB_URI
  }
};

module.exports = _.extend(config.all, config[env], {

  env: env,
  root: root,
  version: pkg.version,

  path: function() {
    var parts = Array.prototype.slice.call(arguments);
    return path.join.apply(path, [ root ].concat(parts));
  }
});
