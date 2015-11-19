angular.module('app.services')

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
      isAuthorized: isAuthorized,
      isAuthenticated: function() {return isAuthenticated;},
      username: function() {return username;}
    };
  });
