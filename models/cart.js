const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
  constructor() {
    this.products = [];
    this.totalPrice = 0;
  }

  static addProduct(id, price) {
    // Fetch previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      const existingProductIndex = cart.products.findIndex(p => p.id === id);
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      cart.products = [
          ...cart.products
      ];
      if (existingProduct) {
        updatedProduct = { 
            ...existingProduct, 
            qty: existingProduct.qty + 1 
        };
        cart.products[existingProductIndex] = updatedProduct;
      } else {
          updatedProduct = {id: id, qty: 1};
          cart.products.push(updatedProduct);
      }

      cart.totalPrice += +(+price).toFixed(2);
      fs.writeFile(p, JSON.stringify(cart), err => {
          console.log(err);
      });
    });

    // Analyze car => find existing product
    // Add new product / increase quatity
  }
};
