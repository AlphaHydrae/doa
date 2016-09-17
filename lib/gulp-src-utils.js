var _ = require('lodash'),
    chain = require('gulp-chain'),
    gulp = require('gulp'),
    sort = require('gulp-sort'),
    stable = require('stable'),
    watch = require('gulp-watch');

module.exports = {
  gulpify: gulpifySrc,
  stableSort: stableSort,
  watch: watchSrc
};

function watchSrc(src, callback) {
  var globs = _.has(src, 'files') ? src.files : src;
  return watch(globs, getSrcOptions(src), callback);
}

function stableSort(compare) {
  return chain(function(stream) {
    return stream.pipe(sort({
      customSortFn: function(files) {
        return stable(files, compare);
      }
    }));
  })();
}

function gulpifySrc(src, options) {
  if (_.isFunction(src)) {
    return gulpifySrc(src(options), options);
  }

  var gulpSrc,
      gulpOptions = _.extend({}, options);

  if (_.isFunction(src.pipe)) {
    // Source is already a file stream.
    gulpSrc = src;
  } else {

    var files;
    if (_.isString(src) || _.isArray(src)) {
      // Source is a file glob or an array thereof.
      files = src;
    } else if (_.isObject(src) && _.has(src, 'files')) {
      // Source is an object with a `files` property that is a file glob or an array thereof.
      files = _.isFunction(src.files) ? src.files() : src.files;
      // The remaining properties of the object are additional options to give to `gulp.src`.
      _.defaults(gulpOptions, src);
    } else {
      // Source is not supported.
      throw new Error('Source of type ' + typeof(src) + ' cannot be gulpified');
    }

    // Transform the file glob(s) into a gulp source.
    gulpSrc = gulp.src(files, getSrcOptions(gulpOptions));
  }

  // Get comparison function from options (if any).
  var compare = gulpOptions.compare;
  delete gulpOptions.compare;

  // Apply the comparison function (if any).
  if (_.isFunction(compare)) {
    gulpSrc = gulpSrc.pipe(stableSort(compare))
  }

  return gulpSrc;
}

function getSrcOptions(src) {
  return _.isObject(src) ? _.omit(src, 'compare', 'files') : {};
}
