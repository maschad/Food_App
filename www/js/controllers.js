angular.module('app.controllers', [])

.controller('AppCtrl',function($scope,$state,$ionicPopup,AuthService,AUTH_EVENTS){
  $scope.username = AuthService.username();

  //When User times out, alert that session lost
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
  //Set the current user name
  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };

})

.controller('loginCtrl', function($scope,AuthService,$ionicPopup,$state) {
  $scope.data = {};
  //controller for the login screen, calls the login in function passing the data and the assigns username variables
  $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      $state.go('main.dash', {}, {reload: true});
      $scope.setCurrentUsername(data.username);
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
})
  // Once user authenticated we proceed to home screen
.controller('homeCtrl', function($scope, $state, $http, $ionicPopup, AuthService) {
  //User can Log out
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };
})

.controller('ordersCtrl', function($scope) {
})

.controller('tabController', function($scope){
});
