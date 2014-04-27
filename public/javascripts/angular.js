var app = angular.module( "doa", [ 'ngAnimate', 'ngClipboard' ]);

app.config([ 'ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath('/javascripts/vendor/ZeroClipboard.swf');
} ]);

app.run([ '$rootScope', function($rootScope) {
  $rootScope.defaultIntervals = [ 3600, 86400, 604800, 2592000 ];
} ]);

app.controller('WatchesController', [ '$scope', 'WatchManager', function($scope, $watchManager) {

  $watchManager.init();

  $scope.$on('init', function(watches) {
    $scope.watches = $watchManager.watches;
  });
} ]);

app.controller('WatchFormController', [ '$scope', 'WatchManager', function($scope, watchManager) {

  function reset() {
    clearErrors();
    $scope.newWatch = {
      name: '',
      interval: 86400
    };
    updateBlank();
  }

  function updateBlank() {
    var name = $scope.newWatch.name;
    $scope.blank = !name || !name.trim().length;
  }

  function clearErrors() {
    delete $scope.serverErrors;
  }

  reset();

  $scope.create = function() {
    clearErrors();
    watchManager.create($scope.newWatch).then(function() {
      reset();
    }, function(err) {
      $scope.serverErrors = err;
    });
  };

  $scope.$watch('newWatch.name', function() {
    updateBlank();
  });
} ]);

app.controller('WatchController', [ '$scope', function($scope) {

  $scope.statusClass = 'panel-info';
  $scope.collapseClass = 'in';
  if ($scope.watch.status == 'up') {
    $scope.statusClass = 'panel-success';
    $scope.collapseClass = '';
  } else if ($scope.watch.status == 'down') {
    $scope.statusClass = 'panel-danger';
    $scope.collapseClass = '';
  }

  $scope.getWatchUrl = function() {
    return $scope.watch.url;
  };
} ]);

app.factory('WatchManager', [ '$rootScope', '$http', '$q', function($rootScope, $http, $q) {

  var service = {
    watches: []
  };

  service.init = function() {
    return $http.get('/watches').then(function(res) {
      service.watches = res.data;
      $rootScope.$broadcast('init', service.watches);
    });
  };

  service.create = function(watch) {
    return $http.post('/watches', watch, { 'Content-Type': 'application/json' }).then(function(res) {
      service.watches.unshift(res.data);
      return res.data;
    });
  };

  return service;
} ]);

app.directive('doaServerErrors', function() {
  return {
    restrict: 'E',
    templateUrl: '/serverErrorsTemplate.html'
  };
});

app.filter('intervalName', function() {

  var names = {
    3600: 'Hourly',
    86400: 'Daily',
    604800: 'Weekly',
    2592000: 'Monthly'
  };

  return function(value) {
    return names[value];
  };
});
