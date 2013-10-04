
module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: [ 'index.js', 'lib/**/*.js', '!lib/assets/js/vendor/**', 'spec/**/*.js', '!spec/browser/support/angular*.js' ]
    },

    jasmine_node: {
      projectRoot: 'spec/server',
      requirejs: false,
      forceExit: true,
      growl: true
    },

    karma: {

      options: {
        configFile: 'karma.conf.js',
        singleRun: true
      },

      dev: {
      },

      ci: {
        browsers: [ 'PhantomJS' ]
      }
    },

    watch: {

      browser: {
        files: [ 'lib/assets/js/**/*.js', 'lib/assets/js/**/*.coffee', 'spec/browser/**/*.js' ],
        tasks: [ 'karma:ci' ],
        options: {
          atBegin: true
        }
      },

      server: {
        files: [ 'lib/**/*.js', '!lib/assets/**', 'spec/server/**/*.js' ],
        tasks: [ 'jasmine_node' ],
        options: {
          atBegin: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'jshint', 'karma:ci', 'jasmine_node' ]);
};
