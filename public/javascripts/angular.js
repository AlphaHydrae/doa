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

app.controller('WatchController', [ '$scope', 'ServerSocket', 'WatchManager', function($scope, serverSocket, watchManager) {

  function reset() {
    $scope.editing = false;
    $scope.watchUpdate = _.clone($scope.watch);
  }

  reset();

  serverSocket.forward([ 'updated', 'update:error' ], $scope);

  $scope.$on('socket:updated', function(ev, watch) {
    if (watch.id == $scope.watch.id) {
      reset();
    }
  });

  function updateStatus() {
    $scope.statusClass = 'panel-info';
    $scope.collapseClass = 'in';
    if ($scope.watch.status == 'up') {
      $scope.statusClass = 'panel-success';
      $scope.collapseClass = '';
    } else if ($scope.watch.status == 'down') {
      $scope.statusClass = 'panel-danger';
      $scope.collapseClass = '';
    }
  }

  updateStatus();
  $scope.$watch('watch.status', updateStatus);
  

  $scope.getWatchUrl = function() {
    return $scope.watch.url;
  };

  $scope.toggleEditing = function() {
    if ($scope.editing) {
      $scope.editing = false;
      reset();
    } else {
      $scope.editing = true;
    }
  };

  $scope.update = function() {
    watchManager.update($scope.watchUpdate);
  };

  $scope.destroy = function() {
    if (confirm('Are you sure you want to delete the "' + $scope.watch.name + '" watch?')) {
      watchManager.delete($scope.watch.id);
    }
  };
} ]);

app.factory('WatchManager', [ '$rootScope', '$q', 'ServerSocket', function($rootScope, $q, serverSocket) {

  var socket,
      service = {
        watches: []
      };

  serverSocket.forward([ 'init', 'created', 'updated', 'pinged', 'deleted' ]);

  $rootScope.$on('socket:init', function (ev, data) {
    service.watches = data.watches;
    $rootScope.$broadcast('init', service.watches);
  });

  $rootScope.$on('socket:created', function(ev, data) {
    service.watches.unshift(data);
  });

  $rootScope.$on('socket:updated', function(ev, data) {
    var watch = _.findWhere(service.watches, { id: data.id });
    _.extend(watch, data);
  });

  $rootScope.$on('socket:pinged', function(ev, data) {
    _.extend(_.findWhere(service.watches, { id: data.id }), data);
  });

  $rootScope.$on('socket:deleted', function(ev, id) {
    var watch = _.findWhere(service.watches, { id: id });
    service.watches.splice(_.indexOf(service.watches, watch), 1);
  });

  service.init = function() {
    serverSocket.emit('init');
  };

  service.create = function(watch) {
    serverSocket.emit('create', watch);
  };

  service.update = function(watch) {
    // TODO: don't do anything if there are no changes
    serverSocket.emit('update', watch);
  };

  service.delete = function(id) {
    serverSocket.emit('delete', id);
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
