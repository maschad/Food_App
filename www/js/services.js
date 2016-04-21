angular.module('app')

.factory("Auth", function($firebaseAuth) {
    var ref = new Firebase("https://kfcapp.firebaseio.com/users");
    var type = null;

    return {
      getAuth : function () {
        return $firebaseAuth(ref);
      },
      setType : function (typ) {
        type = typ;
      },
      getType : function () {
        return type;
      }
    }
})

.factory('Customer', function (Auth) {
    var authRef=  Auth.getAuth();
    var authData = authRef.$getAuth();
    var uid = authData.uid;

    return{
        getCustomerID : function () {
          return uid;
        },
        getCustomerName : function () {
          if(Auth.getType() == 'google'){
            console.log(authData.google.displayName);
            return authData.google.displayName;
          }
        },
        logout : function () {
          return authRef.$unauth();
        }
    }
})

.factory('Employee', function (Auth) {
  /** #TODO: class for employees
   *
   */
    var authRef=  Auth.getAuth();
    var  authData = authRef.$getAuth();
    var employeeID = authData.uid;
    return{
      getEmployeeID: function () {
        return uid;
      }
    }
})

.factory('Location' ,function ($cordovaGeolocation) {

  return {

    getMap: function () {

      // Map variables
      var options = {timeout: 10000, enableHighAccuracy: true};

      $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
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
        //Attaching map Object to DOM
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        //Set my location
        var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
        var me = new google.maps.Marker({
          position: latLng,
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          icon: image
        });

        //Wait until the map is loaded
        google.maps.event.addListenerOnce(map, 'idle', function () {

          //Request for nearby kfc
          var request = {
            location: latLng,
            radius: 500,
            name: ['kfc']
          };

          //Find KFC's using places Service
          var service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);

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
              map: map,
              position: place.geometry.location
            });
            //Listener for the marker
            google.maps.event.addListener(marker, 'click', function () {
              //if marker is clicked, get directions
              infoWindow.open(map, marker);
              infoWindow.setContent(place.name);
              var directionsService = new google.maps.DirectionsService;
              var directionsDisplay = new google.maps.DirectionsRenderer();
              //Calculate the route
              directionsService.route({
                origin: me.position,
                destination: marker.position,
                travelMode: google.maps.TravelMode.DRIVING
              }, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                  directionsDisplay.setDirections(response);
                  directionsDisplay.setMap(map);
                } else {
                  window.alert('Directions request failed due to ' + status);
                }
              });
            });
          }

          //Marker listener for MY location
          google.maps.event.addListener(me, 'click', function () {
            infoWindow.open(map, me);
          });
        });


      }, function (error) {
        console.log("Could not get location");
      });

      return map;
    }
  }
})

.factory('Branch',function () {

})

.factory('Order',function($firebaseArray,Customer) {
  //variables
  //retrieve current customer on initialization
  var user = Customer.getCustomerID();
  var ref = new Firebase('https://kfcapp.firebaseio.com/users/' + user);
  var list = $firebaseArray(ref.child('orders'));
  var cart = {};
  cart.items = [];
  cart.total = 0;

  //all possible Orders
  var orders = [{
    id: 0,
    name: 'Meal Deal',
    icon: 'img/mealDeal.png',
    price: 250.00
  },
  {
    id: 1,
    name: 'Zinger',
    icon: 'img/Zinger.png',
    price: 300.00
  },
  {
    id: 2,
    name: 'Famous Bowl',
    icon: 'img/famous.png',
    price: 150.00
  },
  {
    id: 3,
    name: 'Nine Piece Bucket',
    icon: 'img/nine.png',
    price: 650.00
  },
  {
    id: 4,
    name: 'Popcorn Chicken',
    icon: 'img/popcorn.png',
    price: 250.00
  },
  {
    id: 5,
    name: 'Wings',
    icon: 'img/wings.png',
    price: 350.00
  },
  {
    id: 6,
    name: 'Fries',
    icon: 'img/fries.png',
    price: 50.00
  },
  {
    id: 7,
    name: 'Biscuit',
    icon: 'img/biscuit.png',
    price: 40.00
  },
  {
    id: 8,
    name: 'Drink',
    icon: 'img/drink.png',
    price: 25.00
  }];

  return {
    all: function () {
      return orders;
    },

    initialize: function () {
      this.cart = {};
      cart.items = [];
      cart.total = 0;
    },

    remove : function (order) {
      orders.splice(orders.indexOf(order), 1);
    },

    get: function (orderId) {
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id == parseInt(orderId)) {
          return orders[i];
        }
      }
      return null;
    },

    addOrder:function (item) {
      cart.items.push(item);
      cart.total = parseFloat(cart.total) + parseFloat(item.price);

    },

    removeOrder : function (item) {
      var index = cart.items.indexOf(item);
      if (index >= 0) {
        cart.total = parseFloat(cart.total) - parseFloat(cart.items[index].price);
        cart.items.splice(index, 1);
        console.log("item deleted");
      }
    },

    getCart:function () {
      return cart;
    },

    placeOrder: function () {
      var toStore = {
        cart: cart,
        created: new Date().toString(),
        user: user
      };
      if (cart.total != 0) {
        list.$add(toStore).then(function (ref) {
          var id = ref.key();
          list.$indexFor(id); // returns location in the array
        });
        return true;
      } else {
        return false;
      }
    },

    clear: function () {
      cart = {};
    }
  }

});


