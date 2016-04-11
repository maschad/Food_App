angular.module('app')

.controller('loginCtrl', function($scope,$ionicPopup,$state,Auth) {
  //controller for the login screen, calls the login in function passing the data and the assigns username variables
  $scope.login = function(username,password) {
    Auth.$authWithPassword({
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
    Auth.$createUser({email:username,password:password}).then(function () {
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
.controller('homeCtrl', function($scope, $state, $http, $ionicPopup, $cordovaGeolocation,Auth,currentAuth) {
  $scope.auth = Auth;

  $scope.auth.$onAuth(function(authData) {
    $scope.authData = authData;
  });

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
    $scope.auth.$unauth();
    $state.go('login');
  };
})

.controller('ordersCtrl', function($scope,$firebaseArray,Orders,$ionicPopup) {
  //To show Delete button
  $scope.data = {
    showDelete: false
  };

  //return current user id
  function getCurrentUser() {
    var ref = new Firebase('https://kfcapp.firebaseio.com');
    var authData = ref.getAuth();
    $scope.user = authData.google.displayName;
    return authData.uid;
  }


  //Deletes Items
  $scope.onItemDelete = function(item){
    Orders.removeOrder(item);
  };

  //To display items
  $scope.cart = Orders.getCart();

  //To edit Items
  $scope.edit = function(item) {
  };
  $scope.placeOrder = function ()
  {
    var ref = new Firebase('https://kfcapp.firebaseio.com/' + getCurrentUser());
    var list = $firebaseArray(ref);
    var order = {
        cart: $scope.cart,
        created: Date.now(),
        user: $scope.user
    };
    if($scope.cart.total != 0) {
      list.$add(order).then(function (ref) {
        var id = ref.key();
        console.log("added record with id " + id);
        list.$indexFor(id); // returns location in the array
        //Pops over for success
        var alertPopup = $ionicPopup.alert({
          title: 'Success',
          template: 'Order added successfully!'
        });
        //clear up orders
        Orders.initialize();
        Orders.getCart();
      });
    }else{
      //alert for empty cart!
      var alertPopup = $ionicPopup.alert({
        title: 'Empty Cart!',
        template: 'Please add an order!'
      });
    }
  }

})

.controller('placeOrderCtrl',function($scope,$ionicPopup,Orders){
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
