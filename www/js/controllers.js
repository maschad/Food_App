angular.module('app')

.controller('loginCtrl', function($scope,$ionicPopup,$state,$firebaseAuth) {
  //controller for the login screen, calls the login in function passing the data and the assigns username variables
  $scope.login = function(username,password) {
    var fbAuth = $firebaseAuth(fb);
    fbAuth.$authWithPassword({
        email:username,
        password:password
    }).then(function(authData) {
      $state.go('tabs.home', {}, {reload: true});
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
  $scope.register = function (username, password) {
    var fbAuth = $firebaseAuth(fb);
    fbAuth.$createUser({email:username,password:password}).then(function () {
      return fbAuth.$authWithPassword({
        email: username,
        password: password
        });
      }).then(function (authData) {
        $state.go('tabs.home', {}, {reload: true});
      }).catch(function (error) {
        console.error("ERROR " + error);
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
.controller('homeCtrl', function($scope, $state, $http, $ionicPopup, $cordovaGeolocation) {

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

.controller('placeOrderCtrl',function($scope,$firebaseObject,$ionicPopup){

    $scope.list = function () {
      fbAuth = fb.getAuth();
      if(fbAuth) {
        var syncObject = $firebaseObject(fb.child("users/" + fbAuth.uid));
        syncObject.$bindTo($scope, "data");
      }
    };

    $scope.create = function() {
      $ionicPopup.prompt({
          title: 'Enter a new TODO item',
          inputType: 'text'
        })
        .then(function(result) {
          if(result !== "") {
            if($scope.data.hasOwnProperty("todos") !== true) {
              $scope.data.todos = [];
            }
            $scope.data.todos.push({title: result});
          } else {
            console.log("Action not completed");
          }
        });
    }

})

.controller('orderDetailCtrl',function($scope,Orders,$stateParams){
  $scope.order = Orders.get($stateParams.orderId);

})
.controller('tabController', function($scope){
});
