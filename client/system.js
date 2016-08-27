(function(global) {

  // Map tells the System loader where to look for things.
  var map = {
    'app': 'assets',
    '@angular': 'node_modules/@angular',
    'lodash': 'node_modules/lodash/lodash.js',
    'moment': 'node_modules/moment/moment.js',
    'rxjs': 'node_modules/rxjs',
    'ng2-slim-loading-bar': 'node_modules/ng2-slim-loading-bar'
  };

  // Packages tells the System loader how to load when no filename and/or no extension.
  var packages = {
    'app': { main: 'main.js',  defaultExtension: 'js' },
    'rxjs': { defaultExtension: 'js' },
    'ng2-slim-loading-bar': { main: 'index.js', defaultExtension: 'js' }
  };

  var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'forms',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'upgrade',
  ];

  // Individual files (~300 requests):
  function packIndex(pkgName) {
    packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
  }

  // Bundled (~40 requests):
  function packUmd(pkgName) {
    packages['@angular/'+pkgName] = { main: '/bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  }

  // Most environments should use UMD; some (Karma) need the individual index files
  var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;

  // Add package entries for angular packages
  ngPackageNames.forEach(setPackageConfig);

  System.config({
    map: map,
    packages: packages
  });

  System.import('app').catch(function(err) {
    console.error(err);
  });
})(this);
