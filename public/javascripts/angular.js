var app = angular.module( "doa", [ 'ngAnimate' ]);

app.run([ '$rootScope', function($rootScope) {
  $rootScope.defaultIntervals = [ 3600, 86400, 604800, 2592000 ];
} ]);

app.controller('WatchesController', [ '$scope', 'WatchManager', function($scope, $watchManager) {
  $scope.watches = $watchManager.watches;
} ]);

app.controller('WatchFormController', [ '$scope', 'WatchManager', function($scope, $watchManager) {

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
    $watchManager.create($scope.newWatch).then(function() {
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

  $scope.statusClass = 'list-group-item-info';
  if ($scope.watch.status == 'up') {
    $scope.statusClass = 'list-group-item-success';
  } else if ($scope.watch.status == 'down') {
    $scope.statusClass = 'list-group-item-danger';
  }
} ]);

app.factory('WatchManager', [ '$q', function($q) {

  var service = {
    watches: [
      { name: 'foo', status: 'up' },
      { name: 'bar', status: 'new' },
      { name: 'baz', status: 'down' }
    ]
  };

  service.create = function(watch) {
    if (Math.random() > 0.5) {
      service.watches.unshift(watch);
      return $q.when(watch);
    } else {
      return $q.reject([ { message: 'Borked.' } ]);
    }
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
