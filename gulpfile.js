// DOA gulpfile
// ============

// TODO: smart livereload

var _ = require('lodash'),
    addSrc = require('gulp-add-src'),
    autoprefixer = require('gulp-autoprefixer'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    env = require('gulp-env'),
    fs = require('fs'),
    getFolderSize = require('get-folder-size'),
    gulp = require('gulp'),
    inject = require('gulp-inject'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
    prettyBytes = require('pretty-bytes'),
    rev = require('gulp-rev'),
    removeHtmlComments = require('gulp-remove-html-comments'),
    runSequence = require('run-sequence'),
    slm = require('slm'),
    stylus = require('gulp-stylus'),
    through = require('through2'),
    ts = require('gulp-typescript'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    watch = require('gulp-watch'),
    webpack = require('webpack-stream');

var root = __dirname,
    tsProject = ts.createProject('client/tsconfig.json');

var PluginError = util.PluginError;

// Configuration
// -------------

// TODO: extract to watched file
var files = {
  js: [
    'node_modules/core-js/client/shim.js',
    'node_modules/zone.js/dist/zone.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/systemjs/dist/system.src.js',
    'node_modules/lodash/lodash.js',
    'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.js'
  ],
  devJs: [
    'dev/assets/system.js'
  ],
  prodJs: [
    'tmp/assets/bundle.js'
  ],
  css: [
    'node_modules/bootstrap/dist/css/bootstrap.css',
    'node_modules/bootstrap/dist/css/bootstrap-theme.css'
  ],
  devCss: [
    'dev/assets/**/*.css'
  ]
};

var src = {
  index: { files: 'index.slm', cwd: 'client' },
  templates: { files: [ '*/**/*.slm', 'app.template.slm' ], cwd: 'client' },
  favicon: { files: 'client/favicon.ico' },
  rawJs: { files: '**/*.js', cwd: 'client' },
  styl: { files: '**/*.styl', cwd: 'client' },
  ts: { files: '**/*.ts', cwd: 'client' },
  main: { files: 'dev/assets/main.js' },
  prodJs: { files: [].concat(files.js).concat(files.prodJs) }
};

var injections = {
  development: {
    js: [].concat(files.js).concat(files.devJs),
    css: [].concat(files.css).concat(files.devCss)
  },
  production: {
    js: [ 'dist/assets/**/*.js' ],
    css: [ 'dist/assets/**/*.css' ]
  }
};

// Cleanup Tasks
// -------------

gulp.task('clean:dist', function() {
  return gulp.src('dist/*', { read: false })
    .pipe(clean());
});

gulp.task('clean:dev', function() {
  return gulp.src('dev/*', { read: false })
    .pipe(clean());
});

gulp.task('clean:tmp', function() {
  return gulp.src('tmp/*', { read: false })
    .pipe(clean());
});

gulp.task('clean', [ 'clean:dist', 'clean:dev', 'clean:tmp' ]);

// Development Tasks
// -----------------

gulp.task('copy:favicon', function() {
  return task(src.favicon)
    .pipe(logFactory('dev'))
    .add(pipeDevFiles)
    .end();
});

gulp.task('copy:js', function() {
  return task(src.rawJs)
    .pipe(logFactory('dev'))
    .add(pipeDevAssets)
    .end();
});

gulp.task('copy', [ 'copy:favicon', 'copy:js' ]);

gulp.task('nodemon', function() {
  livereload.listen();

  return nodemon({
    script: 'bin/www',
    ext: 'js',
    watch: [ 'bin/www', 'config/**/*.js', 'server/**/*.js' ],
    ignore: [ '.git', 'client', 'node_modules' ],
    stdout: false
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });

    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('slm:templates', function() {
  return task(src.templates)
    .pipe(logFactory('dev', 'slm', 'html'))
    .add(pipeSlm)
    .add(pipeDevFiles)
    .end();
});

gulp.task('slm:index', function() {
  return task(src.index)
    .pipe(logFactory('dev', 'slm', 'html'))
    .add(pipeSlm)
    .add(pipeAutoInjectFactory('dev'))
    .add(pipeDevFiles)
    .end();
});

gulp.task('slm', [ 'slm:templates', 'slm:index' ]);

gulp.task('styl', function() {
  return task(src.styl)
    .pipe(logFactory('dev/assets', 'styl', 'css'))
    .add(pipeCompileStylus)
    .add(pipeDevAssets)
    .end();
});

gulp.task('ts', function() {
  return task(src.ts)
    .add(pipeCompileTypescript)
    .add(pipeDevAssets)
    .end();
});

gulp.task('compile', sequence('clean:dev', [ 'copy', 'ts', 'slm:templates', 'styl' ], 'slm:index'));

gulp.task('watch:slm:templates', function() {
  return watchSrc(src.templates, function(file) {
    return watchTask(file, 'client')
      .pipe(logFactory('dev', 'slm', 'html'))
      .add(pipeSlm)
      .add(pipeDevFiles)
      .end();
  });
});

gulp.task('watch:slm:index', function() {
  return watchSrc(src.index, function(file) {
    return watchTask(file, 'client')
      .pipe(logFactory('dev', 'slm', 'html'))
      .add(pipeSlm)
      .add(pipeAutoInjectFactory('dev'))
      .add(pipeDevFiles)
      .end();
  });
});

gulp.task('watch:styl', function() {
  return watchSrc(src.styl, function(file) {
    return watchTask(file, 'client')
      .pipe(logFactory('dev/assets', 'styl', 'css'))
      .add(pipeCompileStylus)
      .add(pipeDevAssets)
      .end();
  });
});

gulp.task('watch:ts', function() {
  return gulp.watch('client/**/*.ts', [ 'ts' ]);
});

gulp.task('watch', [ 'watch:slm:templates', 'watch:slm:index', 'watch:styl', 'watch:ts' ]);

gulp.task('dev', sequence('clean:dev', 'compile', [ 'nodemon', 'watch' ]));

// Production Tasks
// ----------------

gulp.task('env:prod', function() {
  env.set({
    NODE_ENV: 'production'
  });
});

gulp.task('dist:css', function() {
  return task(src.styl)
    .add(pipeCompileStylus)
    .pipe(addSrc.prepend(files.css))
    .pipe(concat('app.css'))
    .pipe(storeDistInitialSizeFactory('css'))
    .pipe(cssmin())
    .add(pipeProdAssets)
    .end();
});

gulp.task('webpack', [ 'ts' ], function() {
  return task(src.main)
    .pipe(webpack({
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('tmp/assets'))
    .end();
});

gulp.task('dist:js', [ 'webpack' ], function() {
  return task(src.prodJs)
    .pipe(concat('app.js'))
    .pipe(storeDistInitialSizeFactory('js'))
    .pipe(uglify())
    .add(pipeProdAssets)
    .end();
});

gulp.task('dist:index', function() {
  return task(src.index)
    .add(pipeSlm)
    .add(pipeAutoInjectFactory('dist'))
    .pipe(storeDistInitialSizeFactory('html'))
    .pipe(removeHtmlComments())
    .add(pipeProdFiles)
    .end();
});

gulp.task('dist:favicon', function() {
  return task(src.favicon)
    .add(pipeProdFiles)
    .end();
});

gulp.task('dist:size', function(callback) {
  getFolderSize('dist', function(err, size) {
    if (err) {
      return callback(err);
    }

    util.log(util.colors.blue('dist - ' + prettyBytes(size)));
    callback();
  });
});

gulp.task('dist', sequence('env:prod', [ 'clean:dist', 'clean:tmp' ], [ 'dist:css', 'dist:favicon', 'dist:js' ], 'dist:index', 'dist:size'));

// Default Task
// ------------

gulp.task('default', [ 'dev' ]);

// Reusable piping functions
// -------------------------

function pipeAutoInjectFactory(dest) {
  return function(src) {

    var config = getConfig()

    function autoInject(files) {
      return inject(gulp.src(files, { read: false }), { ignorePath: dest });
    }

    return task(src)
      .pipe(autoInject(injections[config.env].js))
      .pipe(autoInject(injections[config.env].css))
      .end();
  };
}

function pipeCompileStylus(src) {
  return src
    .pipe(stylus())
    .pipe(autoprefixer());
}

function pipeCompileTypescript(src) {
  return src
    .pipe(ts(tsProject));
}

function pipeDevFiles(src, dir) {
  return src
    .pipe(gulp.dest('dev'))
    .pipe(livereload());
}

function pipeDevAssets(src) {
  return src
    .pipe(gulp.dest('dev/assets'))
    .pipe(livereload());
}

function pipeProdFiles(src) {
  return src
    .pipe(gulp.dest('dist'))
    .pipe(logDistFactory());
}

function pipeProdAssets(src) {
  return src
    .pipe(rev())
    .pipe(gulp.dest('dist/assets'))
    .pipe(logDistFactory());
}

function pipeSlm(src) {
  return src
    .pipe(through.obj(compileSlm))
    .on('error', util.log);
}

// Utility functions
// -----------------

var _config;
function getConfig() {
  if (!_config) {
    _config = require('./config');
  }

  return _config;
}

function logFactory(to, fromExt, toExt, from) {
  if (!from) {
    from = 'client';
  }

  return through.obj(function(file, enc, callback) {

    var relativePath = path.relative(from, file.path),
        fromPath = path.join(from, relativePath),
        toPath = path.join(to, relativePath);

    if (fromExt && toExt) {
      toPath = toPath.replace(new RegExp('\\.' + fromExt + '$'), '.' + toExt)
    }

    util.log(util.colors.cyan(fromPath) + ' -> ' + util.colors.cyan(toPath));

    callback(null, file);
  });
}

var sizes = {};

function storeDistInitialSizeFactory(name) {
  sizes[name] = 0;

  return through.obj(function(file, enc, callback) {
    sizes[name] += file.contents.length;
    callback(null, file);
  });
}

function logDistFactory(name) {
  return through.obj(function(file, enc, callback) {

    var relativePath = path.relative('dist', file.path),
        toPath = path.join('dist', relativePath);

    var size = prettyBytes(file.contents.length);

    var name = toPath.replace(/.*\./, '');
    if (sizes[name]) {
      size = prettyBytes(sizes[name]) + ' -> ' + size;
    }

    util.log(util.colors.blue(toPath + ' - ' + size));

    callback(null, file);
  });
}

function compileSlm(file, enc, cb) {
  if (file.isStream()) {
    return cb(new PluginError('gulp-slm', 'Streaming not supported'));
  }

  file.path = file.path.replace(/\.slm$/, '.html');

  if (file.isBuffer()) {
    try {

      var locals = getConfig(),
          template = slm.compile(String(file.contents));

      file.contents = new Buffer(template(locals));
    } catch(e) {
      e.message = 'Slim template error in ' + path.relative(root, file.path) + '; ' + e.message;
      return cb(new PluginError('gulp-slm', e));
    }
  }

  cb(null, file);
}

function sequence() {
  var tasks = Array.prototype.slice.call(arguments);
  return function(callback) {
    return runSequence.apply(undefined, [].concat(tasks).concat([ callback ]));
  };
}

function gulpifySrc(src) {
  return gulp.src(src.files, getSrcOptions(src));
}

function getSrcOptions(src) {
  return _.pick(src, 'base', 'cwd');
}

function task(src) {
  return new TaskBuilder(src);
}

function TaskBuilder(src) {
  if (typeof(src.pipe) == 'function') {
    this.src = src;
  } else if (src.files) {
    this.src = gulpifySrc(src);
  } else {
    this.src = gulp.src(src);
  }
}

TaskBuilder.prototype.add = function(func) {
  this.src = func(this.src);
  return this;
};

TaskBuilder.prototype.pipe = function(func) {
  this.src = this.src.pipe(func);
  return this;
};

TaskBuilder.prototype.end = function() {
  return this.src;
};

function watchSrc(src, callback) {
  return watch(src.files, getSrcOptions(src), callback);
}

function watchTask(file, base) {
  return task({ files: file.path, base: base });
}
