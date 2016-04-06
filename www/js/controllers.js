angular.module('app')

.controller('loginCtrl', function($scope,$ionicPopup,$state,AuthService,Auth) {
  $scope.data = {};
  //controller for the login screen, calls the login in function passing the data and the assigns username variables
  $scope.login = function(data) {
    AuthService.login(data.username, data.password).then(function(authenticated) {
      $state.go('tabs.home', {}, {reload: true});
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
  //Google login
  $scope.loginWithGoogle = function(){
    Auth.$authWithOAuthPopup('google')
      .then(function(authData) {
        $state.go('tabs.home');
      });
  }
})
  // Once user authenticated we proceed to home screen
.controller('homeCtrl', function($scope, $state, $http, $ionicPopup, $cordovaGeolocation, AuthService) {
  // Map stuff
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  }, function(error){
    console.log("Could not get location");
  });

  //User can Log out
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };
})

.controller('ordersCtrl', function($scope,Orders) {
  //To show Delete button
  $scope.data = {
    showDelete: false
  };

  //Deletes Items
  $scope.onItemDelete = function(item){
    Orders.removeOrder(item);
  };
    //To display items
    $scope.cart = Orders.showOrders();
    //To edit Items
    $scope.edit = function(item) {
  };

})

.controller('placeOrderCtrl',function($scope,Orders){
  //Show all available orders for selection
  $scope.orders = Orders.all();

  // When an order is selected add it my orders
  $scope.addOrder = function(item){
    Orders.addOrder(item);
  };

})

.controller('orderDetailCtrl',function($scope,Orders,$stateParams){
  $scope.order = Orders.get($stateParams.orderId);

})
.controller('tabController', function($scope){
});
