// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider,$urlRouterProvider) {

  //Router for state management
  $stateProvider

  //Route to home page 
  .state('tabs',{
    url:'/tabs',
    templateUrl:'templates/tabsController.html'
  })

  .state('home',{
    url:'/home',
    views:{
      home:{
        templateUrl:'templateUrl/home.html'
      }
    }
  })

  .state('orders',{
    url:'/orders',
    views:{
      orders:{
        templateUrl:'templateUrl/orders.html'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
  
})

