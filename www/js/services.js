angular.module('app')

.factory('Order',function($firebaseArray) {

  //return current user id
  function getCurrentUser() {
    var ref = new Firebase('https://kfcapp.firebaseio.com/users');
    var authData = ref.getAuth();
    return authData.uid;
  };

  var Order = function () {
    var ref = new Firebase('https://kfcapp.firebaseio.com/users/' + getCurrentUser());
    var list = $firebaseArray(ref.child('orders'));
    var cart = {};
    cart.items = [];
    cart.total = 0;
  };


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


  Order.all = function () {
    return orders;
  };

  Order.initialize = function () {
    this.cart ={};
    cart.items =[];
    cart.total = 0;
  };

  Order.remove = function (order) {
    orders.splice(orders.indexOf(order), 1);
  };

  Order.get = function (orderId) {
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id == parseInt(orderId)) {
        return orders[i];
      }
    }
    return null;
  };

  Order.addOrder = function(item){
    cart.items.push(item);
    cart.total = parseFloat(cart.total) + parseFloat(item.price);

  };

  Order.removeOrder = function(item){
    var index = cart.items.indexOf(item);
    if (index >= 0) {
      cart.total = parseFloat(cart.total) - parseFloat(cart.items[index].price);
      cart.items.splice(index, 1);
      console.log("item deleted");
    }
  };

  Order.getCart = function () {
    return cart;
  };

  Order.placeOrder = function () {
    var toStore = {
      cart: cart,
      created: new Date().toString(),
      user: user
    };
    if(cart.total != 0) {
      list.$add(order).then(function (ref) {
        var id = ref.key();
        list.$indexFor(id); // returns location in the array
        return true;
      })
    }else{
      return false;
    }
  };

  Order.clear = function () {
    cart = {};
  };

  return Order;
});


