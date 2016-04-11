angular.module('app')

.factory('Orders',function() {

  var cart ={};
  cart.items =[];
  cart.total = 0;

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
    initialize:function () {
      this.cart ={};
      cart.items =[];
      cart.total = 0;
    },
    remove: function (order) {
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
    addOrder:function(item){
      cart.items.push(item);
      cart.total = parseFloat(cart.total) + parseFloat(item.price);

    },
    removeOrder:function(item){
      var index = cart.items.indexOf(item);
      if (index >= 0) {
        cart.total = parseFloat(cart.total) - parseFloat(cart.items[index].price);
        cart.items.splice(index, 1);
        console.log("item deleted");
      }
    },
    getCart: function () {
      return cart;
    },
    clear: function () {
      cart = {};
    }
  }
});


