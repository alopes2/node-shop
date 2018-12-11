const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'cart.json');
const fetchCart = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(fileContent));
    });
  });
};

const saveNewCart = cart => {
  return new Promise((resolve, reject) => {
    fs.writeFile(p, JSON.stringify(cart), err => {
      if (err) {
        reject(err);
      }
      resolve(cart);
    });
  });
};

module.exports = class Cart {
  constructor() {
    this.products = [];
    this.totalPrice = 0;
  }

  static async addProduct(id, price) {
    let cart;
    try {
      cart = await fetchCart();
    } catch (e) {
      cart = cart = { products: [], totalPrice: 0 };
    }
    // Fetch previous cart
    const existingProductIndex = cart.products.findIndex(p => p.id === id);
    const existingProduct = cart.products[existingProductIndex];
    let updatedProduct;
    cart.products = [...cart.products];
    if (existingProduct) {
      updatedProduct = {
        ...existingProduct,
        qty: existingProduct.qty + 1
      };
      cart.products[existingProductIndex] = updatedProduct;
    } else {
      updatedProduct = { id: id, qty: 1 };
      cart.products.push(updatedProduct);
    }

    cart.totalPrice += +(+price).toFixed(2);

    await saveNewCart(cart);
    // Analyze cart => find existing product
    // Add new product / increase quatity
  }

  static async deleteProduct(id, productPrice) {
    const cart = await fetchCart();

    console.log(cart);
    const updatedCart = { ...cart };
    const product = updatedCart.products.find(p => p.id === id);

    const productQty = product.qty;
    updatedCart.products = updatedCart.products.filter(p => p.id !== id);
    updatedCart.totalPrice -= productPrice * productQty;

    await saveNewCart(updatedCart);
  }

  static getCart() {
    return fetchCart();
  }
};
