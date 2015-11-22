angular.module('app')

  .service('AuthService', function($q, $http) {
    var LOCAL_TOKEN_KEY = 'yourTokenKey';
    var username = '';//username not sent yet
    var isAuthenticated = false;// Intially user is not logged in
    var authToken;//authentication token

    // function to retrieve current User credentials locally stored
    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }
    // function to store user credentials locally
    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }
    // Evaluate User attributes for login
    function useCredentials(token) {
      username = token.split('.')[0];
      isAuthenticated = true;
      authToken = token;

      // Set the token as header for requests
      $http.defaults.headers.common['X-Auth-Token'] = token;
    }
    //When logout function is called we must destroy credentials
    function destroyUserCredentials() {
      authToken = undefined;
      username = '';
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }
    //name and password passed in for comparisons against database
    var login = function(name, pw) {
      return $q(function(resolve, reject) {
        if ((name == 'admin' && pw == '1') || (name == 'user' && pw == '1')) {
          // Make a request and receive your auth token from your server
          storeUserCredentials(name + '.yourServerToken');
          resolve('Login success.');
        } else {
          reject('Login Failed.');
        }
      });
    };
    // logout function is called , which destroys credentials
    var logout = function() {
      destroyUserCredentials();
    };

    loadUserCredentials();

    return {
      login: login,
      logout: logout,
      isAuthenticated: function() {return isAuthenticated;},
      username: function() {return username;}
    };
  })

.factory('Orders',function(){

  var orders = [{
    id:0,
    name:'Meal Deal',
    icon:'img/mealDeal.png',
    price:250.00,
    quantity:0
  },
    {
      id:1,
      name:'Zinger',
      icon:'img/Zinger.png',
      price:300.00,
      quantity:0
    }];

  return{
    all:function(){
      return orders;
    },
    remove:function(order){
      orders.splice(orders.indexOf(order),1);
      order.quantity -= 1;
      order.placed = true;
    },
    get:function(orderId){
      for(var i=0; i < orders.length; i++){
        if(orders[i].id == orderId.id){
          return orders[i];
        }
      }
      return null;
    },
    choose:function(orderId){
      var toChoose = this.get(orderId);
      toChoose.quantity += 1;
      toChoose.placed = true;
      return toChoose;
    },
    toShow:function(){
      var toRet;
      for(var i=0; i < orders.length; i++){
        if(orders[i].quantity > 0){
          toRet.add(orders[i]);
        }
      }
      return toRet;
    }
  };
});
