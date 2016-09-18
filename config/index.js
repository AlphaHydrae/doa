var _ = require('lodash'),
    env = process.env.NODE_ENV || 'development',
    log4js = require('log4js'),
    path = require('path');

var pkg = require(path.join('..', 'package')),
    root = path.normalize(path.join(__dirname, '..'));

var liveReloadPort = parseConfigInt(process.env.LIVERELOAD_PORT) || 35729;

var config = {
  all: {
    db: process.env.DOA_MONGODB_URI || 'mongodb://localhost/doa',
    bcryptCost: parseConfigInt(process.env.DOA_BCRYPT_COST) || 10,
    jwtSecret: process.env.DOA_SECRET || 'changeme',
    port: parseConfigInt(process.env.PORT) || 3000,
    buildDir: path.join(root, 'build', env),
    tmpDir: path.join(root, 'tmp', env)
  },

  development: {
    liveReloadUrl: process.env.LIVERELOAD_URL || 'http://localhost:' + liveReloadPort + '/livereload.js'
  },

  test: {
    db: process.env.DOA_MONGODB_URI || 'mongodb://localhost/doa-test',
  },

  production: {
  }
};

module.exports = _.extend(config.all, config[env], {

  env: env,
  root: root,
  version: pkg.version,

  path: function() {
    var parts = Array.prototype.slice.call(arguments);
    return path.join.apply(path, [ root ].concat(parts));
  },

  logger: function(name) {
    return log4js.getLogger(name);
  }
});

function parseConfigInt(value) {
  if (value === undefined) {
    return undefined;
  }

  var parsed = parseInt(value, 10);
  if (_.isNaN(parsed)) {
    throw new Error(value + ' is not a valid integer');
  }

  return parsed;
}
