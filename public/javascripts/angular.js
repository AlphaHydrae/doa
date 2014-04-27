var app = angular.module( "doa", [ 'ngAnimate', 'ngClipboard', 'ui.bootstrap', 'btford.socket-io' ]);

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

app.controller('WatchFormController', [ '$scope', 'WatchManager', 'ServerSocket', function($scope, watchManager, serverSocket) {

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

  serverSocket.forward([ 'created', 'create:error' ], $scope);

  $scope.$on('socket:create:error', function(err) {
    $scope.serverErrors = err;
  });

  $scope.$on('socket:created', reset);

  $scope.create = function() {
    clearErrors();
    watchManager.create($scope.newWatch);
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

app.factory('WatchManager', [ '$rootScope', '$q', 'ServerSocket', function($rootScope, $q, serverSocket) {

  var socket,
      service = {
        watches: []
      };

  serverSocket.forward([ 'init', 'created' ]);

  $rootScope.$on('socket:init', function (ev, data) {
    service.watches = data.watches;
    $rootScope.$broadcast('init', service.watches);
  });

  $rootScope.$on('socket:created', function(ev, data) {
    service.watches.unshift(data);
  });

  service.init = function() {
    serverSocket.emit('init');
  };

  service.create = function(watch) {
    serverSocket.emit('create', watch);
  };

  return service;
} ]);

app.factory('ServerSocket', [ 'socketFactory', function(socketFactory) {

  var socket = socketFactory({
    ioSocket: io.connect('http://localhost:3000')
  });

  return socket;
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
