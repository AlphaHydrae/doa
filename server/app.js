var _ = require('lodash'),
    bodyParser = require('body-parser'),
    errors = require('./lib/errors'),
    express = require('express'),
    favicon = require('serve-favicon'),
    log4js = require('log4js'),
    path = require('path');

require('./promisify');

var app = express(),
    config = require(path.join(__dirname, '..', 'config'));

// view engine setup
app.set('views', config.path('server'));
app.set('view engine', 'slm');

var logger = config.logger('express'),
    connectLogger = log4js.connectLogger(logger, {
      level: log4js.levels.TRACE,
      format: ':method :url :status :response-time ms'
    })

if (config.env == 'development') {
  var groupLog = [ /^\/assets\//, /^\/node_modules\// ];

  app.use(function(req, res, next) {

    var group = _.some(groupLog, function(regexp) {
      return regexp.exec(req.path);
    });

    if (group) {
      logAssets(req, res, next);
    } else {
      connectLogger(req, res, next);
    }
  });

  var start = null,
      groupedCount = 0;

  function logAssets(req, res, next) {

    if (!start) {
      start = new Date().getTime();
    }

    groupedCount++;

    logAssetsDebounced(req, res, next);

    next();
  }

  var logAssetsDebounced = _.debounce(function(req, res ,next) {

    logger.trace('GET ... (' + groupedCount + ' assets) ' + (new Date().getTime() - start) + ' ms');

    start = null;
    groupedCount = 0;
  }, 1000);
} else {
  app.use(connectLogger);
}

if (config.env != 'test') {
  app.use(favicon(path.join(config.buildDir, 'favicon.ico')));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(config.buildDir));

if (config.env == 'development') {
  app.use('/node_modules', express.static(config.path('node_modules')));
}

app.use('/api', require('./api'));

require('./db');

var router = express.Router();

function serveIndex(req, res) {
  res.sendFile('index.html', { root: config.buildDir });
}

router.all('/api/*', function(req, res) {
  res.sendStatus(404);
});

router.get('/', serveIndex);
router.get('/*', serveIndex);

app.use('/', router);

// catch 404 and forward to error handler
app.use(errors.catch404);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') !== 'production') {
  app.use(function(err, req, res, next) {
    logger.warn(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
