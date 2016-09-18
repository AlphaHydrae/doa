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
    filter = require('gulp-filter'),
    fs = require('fs'),
    getFolderSize = require('get-folder-size'),
    gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    handlebars = require('gulp-compile-handlebars'),
    htmlmin = require('gulp-htmlmin'),
    htmlMinifier = require('html-minifier'),
    htmlPrettify = require('gulp-html-prettify'),
    inject = require('gulp-inject'),
    inlineTemplates = require('gulp-inline-ng2-template'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    merge = require('merge-stream'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
    prettyBytes = require('pretty-bytes'),
    rename = require('gulp-rename'),
    rev = require('gulp-rev'),
    revDeleteOriginal = require('gulp-rev-delete-original'),
    revReplace = require('gulp-rev-replace'),
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
  fonts: { files: 'fonts/**/*', cwd: 'node_modules/bootstrap/dist' },
  index: { files: 'index.slm', cwd: 'client' },
  templates: { files: [ '**/*.slm', '!index.slm' ], cwd: 'client' },
  favicon: { files: 'client/favicon.ico' },
  less: { files: '**/*.less', cwd: 'client'  },
  rawJs: { files: '**/*.js', cwd: 'client' },
  styl: { files: '**/*.styl', cwd: 'client' },
  ts: { files: '**/*.ts', cwd: 'client' },
  tsConfig: { files: 'config/config.ts.hbs' },
  prodIndex: { files: 'index.html', cwd: 'build/production' },
  prodStyl: { files: [ '**/*.styl', '!components/**/*', '!**/*.component.styl' ], cwd: 'client' },
  prodComponentsStyl: { files: [ 'components/**/*.styl', '**/*.component.styl' ], cwd: 'client', base: 'client' },
  prodBuild: { files: '**/*', cwd: 'build/production' },
  prodMain: { files: 'tmp/production/assets/main.js' },
  prodJs: { files: 'tmp/production/bundle.js' }
};

var injections = {
  development: {
    js: [ 'build/development/assets/system.js' ],
    css: { files: [ 'build/development/assets/**/*.css', '!build/development/assets/components/**/*', '!build/development/**/*.component.css' ], compare: compareStylesheets }
  },
  production: {
    js: [ 'build/production/assets/**/*.js' ],
    css: [ 'build/production/assets/**/*.css' ]
  }
};

var filters = {
  rev: filter([ 'assets/**/*' ], { restore: true })
};

// Cleanup Tasks
// -------------

gulp.task('clean:dev', function() {
  return gulp.src('build/development/*', { read: false })
    .pipe(clean());
});

gulp.task('clean:prod:tmp', function() {
  return gulp.src('tmp/production/*', { read: false })
    .pipe(clean());
});

gulp.task('clean:prod', [ 'clean:prod:tmp' ], function() {
  return gulp.src('build/production/*', { read: false })
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

gulp.task('ts:config', function() {
  return gulp.src('config/config.ts.hbs')
    .pipe(handlebars(getConfig(), {
      helpers: {
        json: function(value) {
          return JSON.stringify(value);
        }
      }
    }))
    .pipe(rename('config.ts'))
    .pipe(gulp.dest('client'));
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

gulp.task('dev:fonts', function() {
  return gulpifySrc(src.fonts)
    .pipe(logBuildFiles())
    .pipe(toDevBuild('assets/fonts'));
});

gulp.task('dev:less', function() {
  return gulpifySrc(src.less)
    .pipe(logBuildFiles('css'))
    .pipe(pipeCompileLess())
    .pipe(toDevBuild('assets'));
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
    .pipe(toDevBuild('assets'));
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

gulp.task('dev:ts:first', sequence('ts:config', 'dev:ts'));

gulp.task('dev:compile', sequence('clean:dev', [ 'dev:copy:js', 'dev:favicon', 'dev:fonts', 'dev:less', 'dev:slm:templates', 'dev:styl', 'dev:ts:first' ], 'dev:slm:index'));

gulp.task('dev:watch:less', function() {
  return watchSrc(src.less, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logBuildFiles('css'))
      .pipe(pipeCompileLess())
      .pipe(toDevBuild('assets'));
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

gulp.task('dev:watch:slm:templates', function() {
  return watchSrc(src.templates, function(file) {
    return changedFileSrc(file, 'client')
      .pipe(logBuildFiles('html'))
      .pipe(pipeSlm())
      .pipe(pipePrettifyHtml())
      .pipe(toDevBuild('assets'));
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

gulp.task('dev:watch', [ 'dev:watch:less', 'dev:watch:slm:index', 'dev:watch:slm:templates', 'dev:watch:styl', 'dev:watch:ts' ]);

gulp.task('dev', sequence('clean:dev', 'dev:compile', [ 'dev:nodemon', 'dev:watch' ]));

// Production Tasks
// ----------------

gulp.task('prod:copy:js', [ 'prod:env' ], function() {
  return gulpifySrc(src.rawJs)
    .pipe(gulp.dest(getTmpDir('assets')));
});

gulp.task('prod:css', [ 'prod:env' ], function() {

  var lessSrc = gulpifySrc(src.less)
    .pipe(pipeCompileLess());

  var stylSrc = gulpifySrc(src.prodStyl)
    .pipe(pipeCompileStylus());

  return merge(lessSrc, stylSrc)
    .pipe(srcUtils.stableSort(compareStylesheets))
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

gulp.task('prod:fonts', [ 'prod:env' ], function() {
  return gulpifySrc(src.fonts)
    .pipe(logProductionFiles())
    .pipe(toBuild('assets/fonts'));
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
    .pipe(htmlmin(htmlMinifierOptions()))
    .pipe(logProductionFiles())
    .pipe(toBuild());
})

gulp.task('prod:minify:js', [ 'prod:useref' ], function() {
  return gulpifySrc({ files: '**/*.js', cwd: getBuildDir() })
    .pipe(logUtils.storeInitialSize('js'))
    .pipe(uglify({
      // TODO: turn mangle back on once the Angular 2 issue is fixed.
      // https://github.com/mishoo/UglifyJS2/issues/999
      // https://github.com/angular/angular/issues/6380
      mangle: false
    }))
    .pipe(logProductionFiles())
    .pipe(toBuild());
});

gulp.task('prod:minify', sequence([ 'prod:minify:css', 'prod:minify:html', 'prod:minify:js' ]));

gulp.task('prod:nodemon', function() {
  return nodemon({
    script: 'bin/www',
    ext: 'js',
    watch: [ 'bin/www', 'config/**/*.js', 'server/**/*.js' ],
    ignore: [ '.git', 'client', 'node_modules' ],
    stdout: false
  }).on('readable', function() {
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('prod:rev', [ 'prod:unreved' ], function() {

  function relativeToAbsolutePath(filename) {
    return '/' + filename;
  }

  return gulpifySrc(src.prodBuild)
    .pipe(filters.rev)
    .pipe(rev())
    .pipe(revDeleteOriginal())
    .pipe(toBuild())
    .pipe(filters.rev.restore)
    .pipe(revReplace({
      modifyUnreved: relativeToAbsolutePath,
      modifyReved: relativeToAbsolutePath
    }))
    .pipe(toBuild());
});

gulp.task('prod:tmp:css', [ 'prod:env' ], function() {
  return gulpifySrc(src.prodComponentsStyl)
    .pipe(pipeCompileStylus())
    .pipe(cssmin())
    .pipe(gulp.dest(getTmpDir('assets')));
});

gulp.task('prod:tmp:templates', [ 'prod:env' ], function() {
  return gulpifySrc(src.templates)
    .pipe(pipeSlm())
    .pipe(logProductionFiles())
    .pipe(gulp.dest(getTmpDir('assets')));
});

gulp.task('prod:ts:config', sequence('prod:env', [ 'prod:tmp:css', 'prod:tmp:templates' ], 'ts:config'));

gulp.task('prod:ts', [ 'prod:ts:config' ], function() {
  return gulpifySrc(src.ts)
    .pipe(virtualMoveTs())
    .pipe(inlineTemplates({
      base: 'tmp/production',
      removeLineBreaks: true,
      templateProcessor: minifyInlineTemplate,
      useRelativePaths: true
    }))
    .pipe(pipeCompileTypescript())
    .pipe(gulp.dest(getTmpDir('assets')));
});

gulp.task('prod:unreved', [ 'prod:favicon', 'prod:fonts', 'prod:minify' ]);

gulp.task('prod:useref', [ 'prod:index' ], function() {
  return gulpifySrc(src.prodIndex)
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

gulp.task('prod:build', sequence('prod:env', 'clean:prod', 'prod:rev', 'clean:prod:tmp', 'build:size'))

gulp.task('prod', sequence('prod:build', 'prod:nodemon'));

// Default Task
// ------------

gulp.task('default', [ 'dev' ]);

// Reusable piping
// ---------------

function pipeAutoInjectFactory() {

  var dest = path.relative(config.root, config.buildDir);

  return chain(function(stream) {

    function autoInject(files) {
      return inject(gulpifySrc(files, { read: false }), { ignorePath: dest });
    }

    return stream
      .pipe(autoInject(injections[config.env].js))
      .pipe(autoInject(injections[config.env].css));
  })();
}

function pipeCompileLess() {
  return chain(function(stream) {
    return stream
      .pipe(less({
        paths: [ 'client', 'node_modules' ]
      }));
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

function virtualMoveTs() {
  return through.obj(function(file, enc, cb) {

    var cwd = 'tmp/production/assets',
        originalBase = file.base,
        base = path.resolve(cwd) + '/';

    file.cwd = cwd;
    file.base = base;
    file.path = path.join(base, path.relative(originalBase, file.path));

    cb(null, file);
  });
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
  return gulp.dest(dest);
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

function htmlMinifierOptions() {
  return {
    caseSensitive: true,
    collapseWhitespace: true,
    removeComments: true
  };
}

function minifyInlineTemplate(path, ext, file, cb) {
  try {
    cb(null, htmlMinifier.minify(file, htmlMinifierOptions()).trim());
  } catch(err) {
    cb(err);
  }
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

function compareStylesheets(f1, f2) {
  if (!isCss(f1) || !isCss(f2)) {
    return f1.path.localeCompare(f2.path);
  }

  var f1Dir = path.dirname(f1.path),
      f1Base = isBaseStylesheet(f1),
      f2Dir = path.dirname(f2.path),
      f2Base = isBaseStylesheet(f2);

  if (f1Dir.indexOf(f2Dir + path.sep) === 0) {
    return 1;
  } else if (f2Dir.indexOf(f1Dir + path.sep) === 0) {
    return -1;
  } else if (f1Dir != f2Dir || f1Base == f2Base) {
    return f1.path.localeCompare(f2.path);
  } else if (f1Base) {
    return -1;
  } else {
    return 1;
  }
}

function isCss(file) {
  return !!file.path.match(/\.css$/);
}

function isBaseStylesheet(file) {
  return !!file.path.match(/\.base\.css$/);
}
