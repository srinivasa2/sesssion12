var module = angular.module('demoApp', ['ngMockE2E', 'ngRoute', 'mgcrea.ngStrap', 'ngAnimate'])
  .config(['$provide', '$routeProvider', '$locationProvider', function($provide, $routeProvider, $locationProvider) {
    $provide.decorator('$httpBackend', function($delegate) {
      var proxy = function(method, url, data, callback, headers) {
        var interceptor = function() {
          var _this = this,
            _arguments = arguments;
          setTimeout(function() {
            callback.apply(_this, _arguments);
          }, 2000);
        };
        return $delegate.call(this, method, url, data, interceptor, headers);
      };
      for (var key in $delegate) {
        proxy[key] = $delegate[key];
      }
      return proxy;
    });
    $routeProvider
      .when('/login', {
        templateUrl: 'user.tpl.html',
        controller: 'UserCtrl'
      })
      .when('/report', {
        templateUrl: 'report.tpl.html',
        controller: 'ReportCtrl',
        resolve: {
          reportdata: ['$http', function($http) {
            return $http.get('report.json').then(function(data) {
              return data.data;
            });
          }]
        }
      })
      .otherwise({
        redirectedTo: '/login'
      });
    $locationProvider.html5Mode(true);
  }]).run(function($httpBackend) {
    $httpBackend.whenPOST('/login').respond(function(method, url, data) {
      var details = angular.fromJson(data);
      if (details.email && details.email === 'test@test.com' && details.password && details.password === "test")
        return [200, {
          loggedIn: true,
          userid: 'testid'
        }, {}];
      else return [200, {
        loggedIn: false
      }, {}];
    });
    //   $httpBackend.whenGET(/^.*\.tpl\.html$/i).passThrough();
    $httpBackend.whenGET(/.*/i).passThrough();
  });

module.factory('UserData', function() {
  var data = {
    email: '',
    password: ''
  };
  return data;
})


module.controller('MainCtrl', ['$scope', function($scope) {}]);
module.controller('UserCtrl', ['$scope', '$http', '$location', 'UserData', function($scope, $http, $location, UserData) {
  $scope.pageclass = "login";
  $scope.data = UserData;
  $scope.loading = false;
  $scope.postResult = 0;
  $scope.submit = function() {
    $scope.loading = true;
    $http.post('/login', $scope.data).success(function(data) {
      $scope.loading = false;
      if (data.loggedIn) {
        $scope.postResult = 1;
        $location.url('/report');
      } else $scope.postResult = 2;
      console.log('result', data);
    });
  };
}]);
module.controller('ReportCtrl', ['$scope', '$http', '$filter', 'reportdata', 'UserData', function($scope, $http, $filter, reportdata, UserData) {
  $scope.pageclass = "report";
  $scope.data = reportdata;
  $scope.userdata = UserData;
  $scope.predicate = "name";
  $scope.reverse = false;
  $scope.orderBy = function(predicateName){
    if(predicateName== $scope.predicate) $scope.reverse=!$scope.reverse;
    else{
      $scope.predicate=predicateName;
      $scope.reverse=false;
    }
  };
  $scope.names= reportdata.map(function(value){return value.name;});
  $scope.sendEmails = function(){
    var emails = [];
    var filtered = $filter('filter')($scope.data, $scope.filter)
    for(var i=0; i<filtered.length; i++){
      if(filtered[i].selected) emails.push(filtered[i].email);
    }
    alert('Emails sent to: ' + emails.join(' , '));
  };
  $scope.deleteRow = function(row){
   var i;
    for(i = 0; i < $scope.data.length; i++){
    if($scope.data[i] == row) break
  }
  $scope.data.splice(i, 1);
  }
}]);