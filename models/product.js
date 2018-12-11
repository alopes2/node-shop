const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'products.json');
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
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  async save() {
    this.id = Math.random().toString();
    const products = await getProductsFromFile();
    
    products.push(this);

    return new Promise((resolve, reject) => {
        fs.writeFile(p, JSON.stringify(products), (err) => {
            console.log(err);
            resolve(products);
        });
    })
  }

  static async fetchAll() {
    return await getProductsFromFile();
  }

  static async findById(id) {
    const products = await getProductsFromFile();
    const product = products.find(p => p.id === id);

    return product
  }
};
