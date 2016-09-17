// DOA gulpfile
// ============

// TODO: smart livereload

var _ = require('lodash'),
    addSrc = require('gulp-add-src'),
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

var logProcessedFiles = _.partial(logUtils.processedFiles, function() {
  return getConfig().buildDir;
});

// Configuration
// -------------

// TODO: extract to watched file
var files = {
  js: [],
  devJs: [
    'build/development/assets/system.js'
  ],
  prodJs: [
    'tmp/production/bundle.js'
  ],
  css: [],
  devCss: [
    'build/development/assets/**/*.css'
  ]
};

var src = {
  index: { files: 'index.slm', cwd: 'client' },
  compiledIndex: function() { return { files: 'index.html', cwd: getBuildDir() }; },
  templates: { files: [ '*/**/*.slm', 'app.template.slm' ], cwd: 'client' },
  favicon: { files: 'client/favicon.ico' },
  rawJs: { files: '**/*.js', cwd: 'client' },
  styl: { files: '**/*.styl', cwd: 'client' },
  ts: { files: '**/*.ts', cwd: 'client' },
  main: { files: _.partial(getSingleFilePath, 'assets/main.js') },
  prodJs: { files: [].concat(files.js).concat(files.prodJs) }
};

var injections = {
  development: {
    js: [].concat(files.js).concat(files.devJs),
    css: [].concat(files.css).concat(files.devCss)
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

  var config = getConfig();

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

gulp.task('copy:favicon', function() {
  return gulpifySrc(src.favicon)
    .pipe(logProcessedFiles())
    .pipe(toBuild());
});

gulp.task('copy:js', function() {
  return gulpifySrc(src.rawJs)
    .pipe(logProcessedFiles())
    .pipe(gulp.dest(getSingleFilesDir('assets')));
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
  return gulpifySrc(src.templates)
    .pipe(logProcessedFiles('html'))
    .pipe(pipeSlm())
    .pipe(pipePrettifyHtml())
    .pipe(toBuild());
});

gulp.task('slm:index', function() {
  return gulpifySrc(src.index)
    .pipe(logProcessedFiles('html'))
    .pipe(pipeSlm())
    .pipe(pipeAutoInjectFactory())
    .pipe(toBuild());
});

gulp.task('slm', [ 'slm:templates', 'slm:index' ]);

gulp.task('styl', function() {
  return gulpifySrc(src.styl)
    .pipe(logProcessedFiles('css', 'assets'))
    .pipe(pipeCompileStylus())
    .pipe(toBuild('assets'));
});

gulp.task('ts', function() {
  return gulpifySrc(src.ts)
    .pipe(pipeCompileTypescript())
    .pipe(gulp.dest(getSingleFilesDir('assets')));
});

gulp.task('compile', sequence('clean:dev', [ 'copy', 'ts', 'slm:templates', 'styl' ], 'slm:index'));

gulp.task('watch:slm:templates', function() {
  return watchSrc(src.templates, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logProcessedFiles('html'))
      .pipe(pipeSlm())
      .pipe(pipePrettifyHtml())
      .pipe(toBuild());
  });
});

gulp.task('watch:slm:index', function() {
  return watchSrc(src.index, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logProcessedFiles('html'))
      .pipe(pipeSlm())
      .pipe(pipeAutoInjectFactory())
      .pipe(toBuild());
  });
});

gulp.task('watch:styl', function() {
  return watchSrc(src.styl, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logProcessedFiles('css', 'assets'))
      .pipe(pipeCompileStylus())
      .pipe(toBuild('assets'));
  });
});

gulp.task('watch:ts', function() {
  return gulp.watch('client/**/*.ts', [ 'ts' ]);
});

gulp.task('watch', [ 'watch:slm:templates', 'watch:slm:index', 'watch:styl', 'watch:ts' ]);

gulp.task('dev', sequence('clean:dev', 'compile', [ 'nodemon', 'watch' ]));

// Production Tasks
// ----------------

gulp.task('prod:css', [ 'prod:env' ], function() {
  return gulpifySrc(src.styl)
    .pipe(pipeCompileStylus())
    .pipe(addSrc.prepend(files.css))
    .pipe(concat('app.css'))
    .pipe(toBuild('assets'));
});

gulp.task('prod:env', function() {
  env.set({
    NODE_ENV: 'production'
  });
});

gulp.task('prod:favicon', function() {
  return gulpifySrc(src.favicon)
    .pipe(toBuild());
});

gulp.task('prod:index', [ 'prod:css', 'prod:js' ], function() {
  return gulpifySrc(src.index)
    .pipe(pipeSlm())
    .pipe(pipeAutoInjectFactory())
    .pipe(pipePrettifyHtml())
    .pipe(logUtils.storeInitialSize('html'))
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
    .pipe(toBuild());
});

gulp.task('prod:minify:html', [ 'prod:useref' ], function() {
  return gulpifySrc({ files: '**/*.html', cwd: getBuildDir() })
    .pipe(logUtils.storeInitialSize('html'))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(toBuild());
})

gulp.task('prod:minify:js', [ 'prod:useref' ], function() {
  return gulpifySrc({ files: '**/*.js', cwd: getBuildDir() })
    .pipe(logUtils.storeInitialSize('js'))
    .pipe(uglify())
    .pipe(toBuild());
});

gulp.task('prod:minify', sequence([ 'prod:minify:css', 'prod:minify:html', 'prod:minify:js' ]));

gulp.task('prod:useref', [ 'prod:index' ], function() {
  return gulpifySrc(src.compiledIndex)
    .pipe(useref({
      searchPath: [ 'build/production', '.' ]
    }))
    .pipe(toBuild());
});

gulp.task('prod:webpack', [ 'copy:js', 'ts' ], function() {

  var config = getConfig();

  return gulpifySrc(src.main)
    .pipe(webpack({
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest(config.tmpDir));
});

gulp.task('prod', sequence('prod:env', 'clean:prod', [ 'prod:favicon', 'prod:minify' ], 'build:size'));

// Default Task
// ------------

gulp.task('default', [ 'dev' ]);

// Reusable piping
// ---------------

function pipeAutoInjectFactory() {
  return chain(function(stream) {

    var config = getConfig()

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

function getConfigPath() {

  var config = getConfig(),
      args = Array.prototype.slice.call(arguments);

  return args.length ? config.path.apply(config, args) : config.root;
}

function getBuildDir(dir) {
  var config = getConfig();
  return path.normalize(path.join(config.buildDir, dir || '.'));
}

function getSingleFilesDir(dir) {
  var config = getConfig();
  return path.normalize(path.join(config.env == 'production' ? config.tmpDir : config.buildDir, dir || '.'));
}

function getSingleFilePath(relativePath) {
  return path.join(getSingleFilesDir(), relativePath);
}

function toBuild(dir) {

  var config = getConfig(),
      dest = path.normalize(path.join(config.buildDir, dir || '.'))

  return chain(function(stream) {
    stream = stream.pipe(gulp.dest(dest));

    if (config.env == 'production') {
      stream = stream.pipe(logUtils.productionFiles(path.relative(config.root, config.buildDir)));
    } else if (config.env == 'development') {
      stream = stream.pipe(livereload());
    }

    return stream;
  })();
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
