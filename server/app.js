var _ = require('lodash'),
    bodyParser = require('body-parser'),
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

var logger = log4js.getLogger('express'),
    connectLogger = log4js.connectLogger(logger, {
      level: log4js.levels.TRACE,
      format: ':method :url :status :response-time ms'
    })

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

app.use(favicon(config.path('dev', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(config.path('dev')));
app.use('/node_modules', express.static(config.path('node_modules')));

app.use('/api', require('./api'));

require('./db');

var router = express.Router();

function serveIndex(req, res) {
  res.sendFile('index.html', { root: config.path('dev') });
}

router.all('/api/*', function(req, res) {
  res.sendStatus(404);
});

router.get('/', serveIndex);
router.get('/*', serveIndex);

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
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
