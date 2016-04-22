angular.module('app')

.controller('loginCtrl', function($scope,$ionicPopup,$state,Auth) {
  //controller for the login screen, calls the login in function passing the data and the assigns username variables
  $scope.login = function(username,password) {
    var toAuth = Auth.getAuth();
    toAuth.$authWithPassword({
        email:username,
        password:password,
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
        Auth.setData(authData);
        $state.go('tabs.home');
      }, function (err) {
          console.log(err);
      });
  }

})


  //Registeration Controller
.controller('registerCtrl', function ($scope,$state,$ionicLoading,$ionicPopup,$firebaseArray,Auth) {

  //Firebase ref
  var ref = Auth.getAuth();

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

  $scope.createUser = function (email,password,name,type) {
    if (!email || !password) {
      var alertPopup = $ionicPopup.alert({
        title: 'Sign up failed!',
        template: 'Please check  fields!'
      });
      return false;
    }
    $scope.show();
    ref.$createUser({
      email:email,
      password:password
    }).then(function (userData) {
      $scope.hide();
      createProfile(userData, email, password, name);
      ref.$authWithPassword(email, password);
      $state.go('tabs.home');
      }).catch(function (error) {
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
            title: 'Something went Wrong :('
          })
        }
    });


    function createProfile(userData, email,password,name) {
      var profileRef = new Firebase("https://kfcapp.firebaseio.com/users");
      //Create User object
      var user = {
        email:email,
        password:password,
        name: name,
        uid: userData.uid
      };
      var obj = $firebaseArray(profileRef);
      obj.$add(user).then(function(ref) {
        var id = ref.key();
        console.log(obj.$indexFor(id)); // returns location in the array
      }, function(error) {
        console.log("Error:", error);
      });
    }
  }

})

  // Once user authenticated we proceed to home screen
.controller('homeCtrl', function($scope, $state, $ionicPopup,Customer,Location) {
  //Storing the customer name
  $scope.name = Customer.getCustomerName();

  //The actual map
  $scope.map = Location.getMap();

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
