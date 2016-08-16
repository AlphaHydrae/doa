var _ = require('lodash'),
    addSrc = require('gulp-add-src'),
    autoprefixer = require('gulp-autoprefixer'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    env = require('gulp-env'),
    gulp = require('gulp'),
    inject = require('gulp-inject'),
    livereload = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
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

var src = {
  index: { files: 'index.slm', options: { cwd: 'client' } },
  templates: { files: [ '*/**/*.slm', 'app.template.slm' ], options: { cwd: 'client' } }
};

var files = {
  polyfills: [
    'node_modules/core-js/client/shim.js',
    'node_modules/zone.js/dist/zone.js',
    'node_modules/reflect-metadata/Reflect.js',
    'node_modules/systemjs/dist/system.src.js',
    'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.js'
  ],
  development: [
    'public/assets/system.js'
  ],
  production: [
    'tmp/assets/bundle.js'
  ],
  css: [
    'node_modules/bootstrap/dist/css/bootstrap.css',
    'node_modules/bootstrap/dist/css/bootstrap-theme.css'
  ]
};

gulp.task('clean:dist', function() {
  return gulp.src('dist/*', { read: false })
    .pipe(clean());
});

gulp.task('clean:public', function() {
  return gulp.src('public/*', { read: false })
    .pipe(clean());
});

gulp.task('clean:tmp', function() {
  return gulp.src('tmp/*', { read: false })
    .pipe(clean());
});

gulp.task('clean', [ 'clean:dist', 'clean:public' ]);

gulp.task('compile', [ 'copy' ], function(callback) {
  return runSequence([ 'slm:content', 'styl', 'ts' ], 'slm:index', callback);
});

gulp.task('copy:favicon', function() {
  return gulp.src('client/favicon.ico')
    .pipe(gulp.dest('public'));
});

gulp.task('copy:js', function() {
  return gulp.src('**/*.js', { cwd: 'client' })
    .pipe(gulp.dest('public/assets'));
});

gulp.task('copy', function(callback) {
  return runSequence([ 'copy:favicon', 'copy:js' ], callback);
});

gulp.task('env:prod', function() {
  env.set({
    NODE_ENV: 'production'
  });
});

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

gulp.task('slm:content', function() {
  return task(src.templates)
    .add(pipeSlm)
    .add(pipeDevFiles);
});

gulp.task('slm:index', function() {
  return task(src.index)
    .add(pipeSlm)
    .add(_.partial(pipeInject, _, [].concat(files.polyfills).concat(files.development), 'public'))
    .add(_.partial(pipeInject, _, [].concat(files.css).concat([ 'public/**/*.css' ]), 'public'))
    .add(pipeDevFiles);
});

gulp.task('slm', function(callback) {
  return runSequence([ 'slm:content', 'slm:index' ], callback);
});

gulp.task('styl', function() {
  return pipeDevAssets(pipeStylus(gulp.src('**/*.styl', { cwd: 'client' })));
});

gulp.task('ts', function() {
  return gulp.src('**/*.ts', { cwd: 'client' })
    .pipe(ts(tsProject))
    .pipe(gulp.dest('public/assets'))
    .pipe(livereload());
});

gulp.task('watch:slm', function() {
  return watch(src.templates.files, src.templates.options, function(file) {
    return task({ files: file.path, options: { base: 'client' } })
      .add(pipeSlm)
      .add(pipeDevFiles);
  });
});

gulp.task('watch:slm:index', function() {
  return watch(src.index.files, src.index.options, function(file) {
    return task({ files: file.path, options: { base: 'client' } })
      .add(pipeSlm)
      .add(_.partial(pipeInject, _, [].concat(files.polyfills).concat(files.development), 'public'))
      .add(_.partial(pipeInject, _, [].concat(files.css).concat([ 'public/**/*.css' ]), 'public'))
      .add(pipeDevFiles);
  });
});

gulp.task('watch:styl', function() {
  return pipeDevAssets(pipeStylus(watch('**/*.styl', {
    cwd: 'client',
    ignoreInitial: true
  })));
});

gulp.task('watch:ts', function() {
  return gulp.watch('client/**/*.ts', [ 'ts' ]);
});

gulp.task('watch', function(callback) {
  return runSequence([ 'watch:slm', 'watch:slm:index', 'watch:styl', 'watch:ts' ], callback);
});

gulp.task('webpack', [ 'ts' ], function() {
  return gulp.src('public/assets/main.js')
    .pipe(webpack({
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('tmp/assets'));
});

gulp.task('dev', function(callback) {
  return runSequence('clean:public', 'compile', [ 'nodemon', 'watch' ], callback);
});

gulp.task('dist:css', function() {
  return pipeProdAssets(pipeStylus(gulp.src('**/*.styl', { cwd: 'client' })).pipe(concat('app.css')).pipe(cssmin()));
});

gulp.task('dist:js', [ 'webpack' ], function() {
  return pipeProdAssets(gulp.src([].concat(files.polyfills).concat(files.production))
    .pipe(concat('app.js'))
    .pipe(uglify()));
});

gulp.task('dist:index', function() {
  return pipeProdFiles(createIndex('dist').pipe(removeHtmlComments()));
});

gulp.task('dist', function(callback) {
  return runSequence('env:prod', [ 'clean:dist', 'clean:tmp' ], [ 'dist:css', 'dist:js' ], 'dist:index', callback);
});

gulp.task('default', [ 'dev' ]);

var config;
function getConfig() {
  if (!config) {
    config = require('./config');
  }

  return config;
}

function createIndex(dest, js) {
  return compileSlmChain(gulp.src('index.slm', { cwd: 'client' }))
    .pipe(inject(gulp.src([].concat(files.css).concat([ dest + '/**/*.css' ]), { read: false }), { ignorePath: dest }))
    .pipe(inject(gulp.src(js || (dest + '/**/*.js'), { read: false }), { ignorePath: dest }));
}

function pipeInject(src, files, dest) {
  return src.pipe(inject(gulp.src(files, { read: false }), { ignorePath: dest }));
}

function pipeStylus(src) {
  return src
    .pipe(stylus())
    .pipe(autoprefixer());
}

function pipeDevFiles(src, dir) {
  return src
    .pipe(gulp.dest(path.relative('.', path.join('public', dir || '.'))))
    .pipe(livereload());
}

function pipeDevAssets(src) {
  return pipeDevFiles(src, 'assets');
}

function pipeProdFiles(src) {
  return src
    .pipe(gulp.dest('dist'));
}

function pipeProdAssets(src) {
  return src
    .pipe(rev())
    .pipe(gulp.dest('dist/assets'));
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

function pipeSlm(src) {
  return src
    .pipe(through.obj(compileSlm))
    .on('error', util.log);
}

function compileSlmChain(src) {
  return src
    .pipe(through.obj(compileSlm))
    .pipe(gulp.dest('public'))
    .pipe(livereload());
}

function task(src) {
  return new TaskBuilder(src);
}

function TaskBuilder(src) {
  if (typeof(src.pipe) == 'function') {
    this.src = src;
  } else if (src.files) {
    this.src = gulp.src(src.files, src.options || {});
  } else {
    this.src = gulp.src(src);
  }
}

TaskBuilder.prototype.add = function(func) {
  this.src = func(this.src);
  return this;
};

TaskBuilder.prototype.end = function() {
  return this.src;
};
