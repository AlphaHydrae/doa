var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    express = require('express'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    path = require('path');

var app = express(),
    config = require(path.join(__dirname, '..', 'config'));

// view engine setup
app.set('views', config.path('server'));
app.set('view engine', 'slm');

app.use(favicon(config.path('dev', 'favicon.ico')));
// TODO: customize logger to group asset logs
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
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
