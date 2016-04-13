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

  //Google login
  $scope.loginWithGoogle = function(){
    Auth.$authWithOAuthPopup('google')
      .then(function(authData) {
        $state.go('tabs.home');
      });
  }

})


  //Registeration Controller
.controller('registerCtrl', function ($scope,$state,$ionicLoading,Auth) {
  $scope.user = {
    email: "",
    password: ""
  };

  $scope.auth = Auth;

  $scope.show = function() {
    $ionicLoading.show({
      template: 'Please Wait... Registering',
      animation:'fade-in',
      showBackdrop:true
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };

  $scope.createUser = function () {
    var email = this.user.email;
    var password = this.user.password;

    if (!email || !password) {
      var alertPopup = $ionicPopup.alert({
        title: 'Sign up failed!',
        template: 'Please check your credentials!'
      });
      return false;
    }
    $scope.show();
    $scope.auth.$createUser(email,password,function (error,user) {
        if(!error){
          $scope.hide();
          $scope.auth.$authWithPassword(email,password);
          $state.go('tabs.home');
        }
        else {
          $state.hide();
          if (error.code == 'INVALID_EMAIL') {
            var alertPopup = $ionicPopup.alert({
              title:'Invalid Email Address'
            });
          }
          else if (error.code == 'EMAIL_TAKEN') {
            var alertPopup = $ionicPopup.alert({
              title:'Email Address already taken'
            });
          }
          else {
            var alertPopup = $ionicPopup.alert({
              title:'Something went Wrong :('
            });
          }
        }
    })
  }

})

  // Once user authenticated we proceed to home screen
.controller('homeCtrl', function($scope, $state, $http, $ionicPopup, $cordovaGeolocation, Auth) {
  $scope.auth = Auth;

  $scope.auth.$onAuth(function(authData) {
    $scope.authData = authData;
  });

  //Array to store results
  $scope.searchResults = [];

  // Map stuff
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    //my current latitude
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    // map options
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Needed for info
    var infoWindow = new google.maps.InfoWindow();

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //Set my location
    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    var me = new google.maps.Marker({
      position: latLng,
      map: $scope.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      icon: image
    });

      //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      // Get current location
      var request = {
        location: latLng,
        radius: 500,
        name: ['kfc']
      };
      var service = new google.maps.places.PlacesService($scope.map);
      service.nearbySearch(request,callback);

      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            var place = results[i];
            createMarker(results[i]);
          }
        }
      }
      function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: $scope.map,
          position: place.geometry.location
        });
        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
          infoWindow.setContent(place.name);
          var directionsService = new google.maps.DirectionsService;
          var directionsDisplay = new google.maps.DirectionsRenderer;
          directionsService.route({
            origin: me.position,
            destination: marker.position,
            travelMode: google.maps.TravelMode.DRIVING
          }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          directionsDisplay.setMap($scope.map);
          });
        });
      }
      google.maps.event.addListener(me, 'click', function () {
        infoWindow.open($scope.map, me);
        infoWindow.setContent(place.name);
      });
    });

    /** #TODO:
    Firebase save
    Store user location
    $scope.user = {};

    $scope.saveDetails = function(){
      var lat = $scope.user.latitude;
      var lgt = $scope.user.longitude;
      var des = $scope.user.desc;

      // Code to write to Firebase will be here
    }
  **/

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
