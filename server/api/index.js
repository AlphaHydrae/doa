var _ = require('lodash'),
    config = require('../../config'),
    express = require('express'),
    glob = require('glob'),
    path = require('path'),
    router = express.Router();

var apiFiles = glob.sync('**/*.api.js', {
  cwd: __dirname
});

var logger = config.logger('api');

_.each(apiFiles, function(apiFile) {

  var apiName = path.basename(apiFile).replace(/\..*/, ''),
      apiRouter = require('./' + apiName + '/' + apiName + '.routes');

  router.use('/' + apiName, apiRouter);

  logger.trace('Registered /' + apiName + ' API routes');
});

module.exports = router;
