var app = angular.module( "doa", [ 'ngAnimate', 'ngClipboard', 'ui.bootstrap', 'btford.socket-io' ]);

app.config([ 'ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath('/javascripts/vendor/ZeroClipboard.swf');
} ]);

app.run([ '$rootScope', function($rootScope) {
  $rootScope.defaultIntervals = [ 3600, 86400, 604800, 2592000 ];
} ]);

app.controller('WatchesController', [ '$rootScope', '$scope', '$interval', 'WatchManager', function($rootScope, $scope, $interval, $watchManager) {

  $watchManager.init();

  $scope.$on('init', function(watches) {
    $scope.watches = $watchManager.watches;
  });

  $interval(function() {
    console.log('Refreshing watches...');
    $rootScope.$broadcast('refresh');
  }, 5000);
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

    var status = watchManager.status($scope.watch);

    if (status == 'new') {
      $scope.statusClass = 'panel-info';
      $scope.collapseClass = 'in';
    } else if (status == 'up') {
      $scope.statusClass = 'panel-success';
      $scope.collapseClass = '';
    } else {
      $scope.statusClass = 'panel-danger';
      $scope.collapseClass = '';
    }
  }

  updateStatus();
  // TODO: replace by $watchGroup when angular 1.3.0 stable
  $scope.$watchCollection('watch', updateStatus);
  $scope.$on('refresh', updateStatus);

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
    console.log('Watches initialized: ' + JSON.stringify(data));
    service.watches = data.watches;
    $rootScope.$broadcast('init', service.watches);
  });

  $rootScope.$on('socket:created', function(ev, data) {
    console.log('Watch created: ' + JSON.stringify(data));
    service.watches.unshift(data);
  });

  $rootScope.$on('socket:updated', function(ev, data) {
    console.log('Watch updated: ' + JSON.stringify(data));
    var watch = _.findWhere(service.watches, { id: data.id });
    _.extend(watch, data);
  });

  $rootScope.$on('socket:pinged', function(ev, data) {
    console.log('Watch pinged: ' + JSON.stringify(data));
    _.extend(_.findWhere(service.watches, { id: data.id }), data);
  });

  $rootScope.$on('socket:deleted', function(ev, id) {
    console.log('Watch deleted: ' + id);
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

  service.status = function(watch) {
    if (!watch.pingedAt) {
      return 'new';
    }

    var pingedAt = moment(watch.pingedAt).unix(),
        interval = watch.interval,
        now = moment().unix();

    if (now <= pingedAt + interval) {
      return 'up';
    } else {
      return 'down';
    }
  };

  return service;
} ]);

app.factory('ServerSocket', [ 'socketFactory', function(socketFactory) {

  var socket = socketFactory({
    ioSocket: io.connect('http://localhost:3000')
  });

  return socket;
} ]);

app.directive('doaStatus', [ '$rootScope', 'WatchManager', function($rootScope, watchManager) {
  return {
    restrict: 'E',
    template: '',
    link: function(scope, e, attr) {

      var chart = new Highcharts.Chart({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          renderTo: e.find('.chart')[0]
        },
        colors: [ '#d0e9c6', '#c4e3f3', '#ebcccc' ],
        title: false,
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true, // TODO: filter displayed watches
            cursor: 'pointer',
            dataLabels: {
              enabled: false
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Count',
          data: [
          ]
        }]
      });

      $rootScope.$on('refresh', function() {

        var counts = _.reduce(watchManager.watches, function(memo, watch) {
          memo[watchManager.status(watch)] += 1;
          return memo;
        }, { up: 0, down: 0, new: 0 });

        var data = [
          [ 'UP', counts.up ],
          [ 'NEW', counts.new ],
          [ 'DOWN', counts.down ]
        ];

        chart.series[0].setData(data);
      });
    }
  };
} ]);

app.directive('doaWatchInterval', [ '$rootScope', '$timeout', function($rootScope, $timeout) {
  return {
    restrict: 'E',
    scope: {
      watch: '='
    },
    templateUrl: '/watchInterval.html',
    link: function(scope, e, attr) {

      var input = e.find('input'),
          currentValue = scope.watch.interval;

      scope.intervals = $rootScope.defaultIntervals;
      scope.custom = !_.contains(scope.intervals, currentValue);

      scope.$watch('watch.interval', function(value) {
        if (!value) {
          scope.custom = true;
          scope.watch.interval = currentValue;
        } else {
          currentValue = value;
        }
      });

      scope.$watch('custom', function(value) {
        if (value) {
          $timeout(function() {
            input.select();
          }, 500);
        }
      });

      input.focusout(function() {
        if (_.contains(scope.intervals, scope.watch.interval)) {
          scope.$apply(function() {
            scope.custom = false;
          });
        }
      });
    }
  };
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

app.filter('default', function() {
  return function(value, defaultValue) {
    return value !== undefined ? value : defaultValue;
  };
});
