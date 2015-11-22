// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic'])

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

  //Route to login

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })

    //Route to home page
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabsController.html'
    })

    .state('tabs.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: 'templates/home.html',
          controller: "homeCtrl"
        }
      }
    })

    .state('tabs.orders', {
      url: '/orders',
      views: {
        'orders-tab': {
          templateUrl: 'templates/orders.html',
          controller: 'ordersCtrl'
        }
      }
    })

    .state('tabs.placeOrder', {
      url:'/placeorder',
      views:{
        'placeorder-tab':{
          templateUrl: 'templates/placeOrder.html',
          controller: 'placeOrderCtrl'
        }
      }
    })
    .state('tab.orderDetail', {
      url: '/placeorder/:orderId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/orderDetail.html',
          controller: 'orderDetailCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});


