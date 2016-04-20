angular.module('app')

.controller('loginCtrl', function($scope,$ionicPopup,$state,Auth) {
  //controller for the login screen, calls the login in function passing the data and the assigns username variables
  $scope.login = function(username,password) {
    var toAuth = Auth.getAuth();
    toAuth.$authWithPassword({
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
    var toAuth = Auth.getAuth();
    toAuth.$authWithOAuthPopup('google')
      .then(function(authData) {
        Auth.setType('google');
        $state.go('tabs.home');
      }, function (err) {
          console.log(err);
      });
  }

})


  //Registeration Controller
.controller('registerCtrl', function ($scope,$state,$ionicLoading,$ionicPopup,$firebase) {

  //Firebase ref
  var ref = new Firebase('https://kfcapp.firebaseio.com/users');

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

  $scope.createUser = function (email,password,name) {

    //Create User object
    var user = {
      email:email,
      password:password,
      name: name
    };

    if (!email || !password) {
      var alertPopup = $ionicPopup.alert({
        title: 'Sign up failed!',
        template: 'Please check  fields!'
      });
      return false;
    }
    $scope.show();
    ref.createUser(user,function (error,userData) {
        if(!error){
          $scope.hide();
          createProfile(userData,user);
          ref.authWithPassword(email,password);
          $state.go('tabs.home');
        }
        else {
          $scope.hide();
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
    });

    function createProfile(userData, user) {
      var profileRef = $firebase(ref.child('profile'));
      return profileRef.$set(authData.uid, user);
    }
  }

})

  // Once user authenticated we proceed to home screen
.controller('homeCtrl', function($scope, $state, $http, $ionicPopup, $cordovaGeolocation, Customer) {
  //Storing the customer name
  $scope.name = Customer.getCustomerName();


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

    // Needed for info for marker
    var infoWindow = new google.maps.InfoWindow();

    //The actual map
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

      //Request for nearby kfc
      var request = {
        location: latLng,
        radius: 500,
        name: ['kfc']
      };

      //Find KFC's using places Service
      var service = new google.maps.places.PlacesService($scope.map);
      service.nearbySearch(request,callback);

      //callback function to list results and createMarkers
      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            var place = results[i];
            createMarker(results[i]);
          }
        }
      }
      //Create markers function
      function createMarker(place) {
        var placeLoc = place.geometry.location;
        console.log('creating marker');
        var marker = new google.maps.Marker({
          map: $scope.map,
          position: place.geometry.location
        });
        //Listener for the marker
        google.maps.event.addListener(marker, 'click', function () {
          //if marker is clicked, get directions
          infoWindow.open($scope.map, marker);
          infoWindow.setContent(place.name);
          var directionsService = new google.maps.DirectionsService;
          var directionsDisplay = new google.maps.DirectionsRenderer();
          //Calculate the route
          directionsService.route({
            origin: me.position,
            destination: marker.position,
            travelMode: google.maps.TravelMode.DRIVING
          }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
              directionsDisplay.setMap($scope.map);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
        });
      }
      //Marker listener for MY location
      google.maps.event.addListener(me, 'click', function () {
        infoWindow.open($scope.map, me);
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
    Customer.logout();
    $state.go('login');
  };
})

.controller('cartCtrl', function($scope, $ionicPopup,Order) {

  //To show Delete button
  $scope.data = {
    showDelete: false
  };


  //to Place an order
  $scope.place = function () {
    //if successful
    if(Order.placeOrder()){
      //Pops over for success
      var alertPopup = $ionicPopup.alert({
        title: 'Success',
        template: 'Order added successfully!'
      });
      //clear up orders
      Order.initialize();
      Order.getCart();
    } else{
    //alert for empty cart!
    var alertPopup = $ionicPopup.alert({
      title: 'Empty Cart!',
      template: 'Please add an order!'
    });
  }

  };

  //Deletes Items
  $scope.onItemDelete = function(item){
    Order.removeOrder(item);
  };

  //To display items
  $scope.cart = Order.getCart();

  //To edit Items
  $scope.edit = function(item) {
  };

})

.controller('orderScreenCtrl',function($scope,$ionicPopup,Order){

  //Show all available orders for selection
  $scope.orders = Order.all();

  // When an order is selected add it my orders
  $scope.addOrder = function(item){
    Order.addOrder(item);
  };

})

.controller('orderDetailCtrl',function($scope,Orders,$stateParams){
  $scope.order = Orders.get($stateParams.orderId);

})
.controller('tabController', function($scope){
});
