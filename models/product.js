const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'products.json');

const Cart = require('./cart');

const getProductsFromFile = callback => {
    return new Promise((resolve, reject) => {
        let data;
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                data = [];
            } else {
                data = JSON.parse(fileContent);
            }
            resolve(data);
        });
    });
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  async save() {
    const products = await getProductsFromFile();
    const updatedProducts = [...products];
    if (this.id) {
        const existingProductIndex = products.findIndex(p => p.id === this.id);
        updatedProducts[existingProductIndex] = this;
    } else {
        this.id = Math.random().toString();
        updatedProducts.push(this);
    }

    return new Promise((resolve, reject) => {
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
            console.log(err);
            resolve(updatedProducts);
        });
    });
  }

  static fetchAll() {
    return getProductsFromFile();
  }

  static async findById(id) {
    const products = await getProductsFromFile();
    const product = products.find(p => p.id === id);

    return product
  }

  static async deleteById(id) {
    const products = await getProductsFromFile();
    const product = products.find(p => p.id === id);
    const updatedProducts = products.filter(p => p.id !== id);

    try {
        await new Promise((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                if (err) {
                    reject(err);
                }
                resolve(updatedProducts);
            });
        });

        await Cart.deleteProduct(id, product.price);
    } catch (e) {
        console.log(e);
    }
  }

};
