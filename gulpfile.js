// DOA gulpfile
// ============

// TODO: smart livereload

var _ = require('lodash'),
    autoprefixer = require('gulp-autoprefixer'),
    chain = require('gulp-chain'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    env = require('gulp-env'),
    fs = require('fs'),
    getFolderSize = require('get-folder-size'),
    gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    htmlmin = require('gulp-htmlmin'),
    htmlPrettify = require('gulp-html-prettify'),
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
    useref = require('gulp-useref'),
    util = require('gulp-util'),
    watch = require('gulp-watch'),
    webpack = require('webpack-stream');

var root = __dirname,
    tsProject = ts.createProject('client/tsconfig.json');

var PluginError = util.PluginError;

var logUtils = require('./lib/gulp-log-utils'),
    srcUtils = require('./lib/gulp-src-utils');

var gulpifySrc = srcUtils.gulpify,
    watchSrc = srcUtils.watch;

// Configuration
// -------------

var src = {
  index: { files: 'index.slm', cwd: 'client' },
  compiledIndex: function() { return { files: 'index.html', cwd: getBuildDir() }; },
  templates: { files: [ '*/**/*.slm', 'app.template.slm' ], cwd: 'client' },
  favicon: { files: 'client/favicon.ico' },
  rawJs: { files: '**/*.js', cwd: 'client' },
  styl: { files: '**/*.styl', cwd: 'client' },
  ts: { files: '**/*.ts', cwd: 'client' },
  prodMain: { files: 'tmp/production/assets/main.js' },
  prodJs: { files: 'tmp/production/bundle.js' }
};

var injections = {
  development: {
    js: [ 'build/development/assets/system.js' ],
    css: [ 'build/development/assets/**/*.css' ]
  },
  production: {
    js: [ 'build/production/assets/**/*.js' ],
    css: [ 'build/production/assets/**/*.css' ]
  }
};

// Cleanup Tasks
// -------------

gulp.task('clean:dev', function() {
  return gulp.src('build/development/*', { read: false })
    .pipe(clean());
});

gulp.task('clean:prod', function() {
  return gulp.src([ 'build/production/*', 'tmp/production/*' ], { read: false })
    .pipe(clean());
});

gulp.task('clean', [ 'clean:dev', 'clean:prod' ]);

// Generic Tasks
// -------------

gulp.task('build:size', function(callback) {
  getFolderSize(config.buildDir, function(err, size) {
    if (err) {
      return callback(err);
    }

    util.log(util.colors.blue(path.relative(config.root, config.buildDir), ' - ' + prettyBytes(size)));
    callback();
  });
});

// Development Tasks
// -----------------

gulp.task('dev:copy:js', function() {
  return gulpifySrc(src.rawJs)
    .pipe(logBuildFiles())
    .pipe(gulp.dest(getBuildDir('assets')));
});

gulp.task('dev:favicon', function() {
  return gulpifySrc(src.favicon)
    .pipe(logBuildFiles())
    .pipe(toDevBuild());
});

gulp.task('dev:nodemon', function() {
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

gulp.task('dev:slm:templates', function() {
  return gulpifySrc(src.templates)
    .pipe(logBuildFiles('html'))
    .pipe(pipeSlm())
    .pipe(pipePrettifyHtml())
    .pipe(toDevBuild());
});

gulp.task('dev:slm:index', function() {
  return gulpifySrc(src.index)
    .pipe(logBuildFiles('html'))
    .pipe(pipeSlm())
    .pipe(pipeAutoInjectFactory())
    .pipe(pipePrettifyHtml())
    .pipe(toDevBuild());
});

gulp.task('dev:styl', function() {
  return gulpifySrc(src.styl)
    .pipe(logBuildFiles('css', 'assets'))
    .pipe(pipeCompileStylus())
    .pipe(toDevBuild('assets'));
});

gulp.task('dev:ts', function() {
  return gulpifySrc(src.ts)
    .pipe(pipeCompileTypescript())
    .pipe(gulp.dest(getBuildDir('assets')));
});

gulp.task('dev:compile', sequence('clean:dev', [ 'dev:copy:js', 'dev:favicon', 'dev:ts', 'dev:slm:templates', 'dev:styl' ], 'dev:slm:index'));

gulp.task('dev:watch:slm:templates', function() {
  return watchSrc(src.templates, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logBuildFiles('html'))
      .pipe(pipeSlm())
      .pipe(pipePrettifyHtml())
      .pipe(toDevBuild());
  });
});

gulp.task('dev:watch:slm:index', function() {
  return watchSrc(src.index, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logBuildFiles('html'))
      .pipe(pipeSlm())
      .pipe(pipeAutoInjectFactory())
      .pipe(toDevBuild());
  });
});

gulp.task('dev:watch:styl', function() {
  return watchSrc(src.styl, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logBuildFiles('css', 'assets'))
      .pipe(pipeCompileStylus())
      .pipe(toDevBuild('assets'));
  });
});

gulp.task('dev:watch:ts', function() {
  return gulp.watch('client/**/*.ts', [ 'dev:ts' ]);
});

gulp.task('dev:watch', [ 'dev:watch:slm:templates', 'dev:watch:slm:index', 'dev:watch:styl', 'dev:watch:ts' ]);

gulp.task('dev', sequence('clean:dev', 'dev:compile', [ 'dev:nodemon', 'dev:watch' ]));

// Production Tasks
// ----------------

gulp.task('prod:copy:js', [ 'prod:env' ], function() {
  return gulpifySrc(src.rawJs)
    .pipe(gulp.dest(getTmpDir('assets')));
});

gulp.task('prod:css', [ 'prod:env' ], function() {
  return gulpifySrc(src.styl)
    .pipe(pipeCompileStylus())
    .pipe(concat('app.css'))
    .pipe(toBuild('assets'));
});

gulp.task('prod:env', function() {
  env.set({
    NODE_ENV: 'production'
  });
});

gulp.task('prod:favicon', [ 'prod:env' ], function() {
  return gulpifySrc(src.favicon)
    .pipe(logProductionFiles())
    .pipe(toBuild());
});

gulp.task('prod:index', [ 'prod:css', 'prod:js' ], function() {
  return gulpifySrc(src.index)
    .pipe(pipeSlm())
    .pipe(pipeAutoInjectFactory())
    .pipe(pipePrettifyHtml())
    .pipe(toBuild());
});

gulp.task('prod:js', [ 'prod:webpack' ], function() {
  return gulpifySrc(src.prodJs)
    .pipe(concat('app.js'))
    .pipe(toBuild('assets'));
});

gulp.task('prod:minify:css', [ 'prod:useref' ], function() {
  return gulpifySrc({ files: '**/*.css', cwd: getBuildDir() })
    .pipe(logUtils.storeInitialSize('css'))
    .pipe(cssmin())
    .pipe(logProductionFiles())
    .pipe(toBuild());
});

gulp.task('prod:minify:html', [ 'prod:useref' ], function() {
  return gulpifySrc({ files: '**/*.html', cwd: getBuildDir() })
    .pipe(logUtils.storeInitialSize('html'))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(logProductionFiles())
    .pipe(toBuild());
})

gulp.task('prod:minify:js', [ 'prod:useref' ], function() {
  return gulpifySrc({ files: '**/*.js', cwd: getBuildDir() })
    .pipe(logUtils.storeInitialSize('js'))
    .pipe(uglify())
    .pipe(logProductionFiles())
    .pipe(toBuild());
});

gulp.task('prod:minify', sequence([ 'prod:minify:css', 'prod:minify:html', 'prod:minify:js' ]));

gulp.task('prod:ts', [ 'prod:env' ], function() {
  return gulpifySrc(src.ts)
    .pipe(pipeCompileTypescript())
    .pipe(gulp.dest(getTmpDir('assets')));
});

gulp.task('prod:useref', [ 'prod:index' ], function() {
  return gulpifySrc(src.compiledIndex)
    .pipe(useref({
      searchPath: [ 'build/production', '.' ]
    }))
    .pipe(toBuild());
});

gulp.task('prod:webpack', [ 'prod:copy:js', 'prod:ts' ], function() {
  return gulpifySrc(src.prodMain)
    .pipe(webpack({
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest(getTmpDir()));
});

gulp.task('prod', sequence('prod:env', 'clean:prod', [ 'prod:favicon', 'prod:minify' ], 'build:size'));

// Default Task
// ------------

gulp.task('default', [ 'dev' ]);

// Reusable piping
// ---------------

function pipeAutoInjectFactory() {
  return chain(function(stream) {

    function autoInject(files) {
      return inject(gulp.src(files, { read: false }), { ignorePath: path.relative(config.root, config.buildDir) });
    }

    return stream
      .pipe(autoInject(injections[config.env].js))
      .pipe(autoInject(injections[config.env].css));
  })();
}

function pipeCompileStylus() {
  return chain(function(stream) {
    return stream
      .pipe(stylus())
      .pipe(autoprefixer());
  })();
}

function pipeCompileTypescript() {
  return chain(function(stream) {
    return stream
      .pipe(ts(tsProject));
  })();
}

function pipeSlm() {
  return chain(function(stream) {
    return stream
      .pipe(through.obj(compileSlm))
      .on('error', util.log);
  })();
}

function pipePrettifyHtml() {
  return chain(function(stream) {
    return stream
      .pipe(htmlPrettify({
        indent_size: 2
      }));
  })();
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

var config = {};
_.each('env root buildDir tmpDir'.split(/\s+/), function(property) {
  Object.defineProperty(config, property, {
    get: function () {
      return getConfig()[property];
    }
  });
});

function getBuildDir(dir) {
  return path.normalize(path.join(config.buildDir, dir || '.'));
}

function getTmpDir(dir) {
  return path.normalize(path.join(config.tmpDir, dir || '.'));
}

function toDevBuild(dir) {

  var dest = path.normalize(path.join(config.buildDir, dir || '.'));

  return chain(function(stream) {
    return stream
      .pipe(gulp.dest(dest))
      .pipe(livereload());
  })();
}

function toBuild(dir) {

  var dest = path.normalize(path.join(config.buildDir, dir || '.'))

  return chain(function(stream) {
    return stream
      .pipe(gulp.dest(dest));
  })();
}

function logBuildFiles() {
  var func = _.partial(logUtils.processedFiles, config.buildDir);
  return func.apply(undefined, Array.prototype.slice.call(arguments));
}

function logProductionFiles() {
  var func = _.partial(logUtils.productionFiles, config.buildDir);
  return func.apply(undefined, Array.prototype.slice.call(arguments));
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

function changedFileSrc(file, base) {
  return gulpifySrc({ files: file.path, base: base });
}

function sequence() {
  var tasks = Array.prototype.slice.call(arguments);
  return function(callback) {
    return runSequence.apply(undefined, [].concat(tasks).concat([ callback ]));
  };
}
