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
  constructor(title) {
    this.title = title;
  }

  async save(callback) {
    const products = await getProductsFromFile();
    
    products.push(this);

    return new Promise((resolve, reject) => {
        fs.writeFile(p, JSON.stringify(products), (err) => {
            console.log(err);
            resolve(products);
        });
    })
  }

  static async fetchAll(callback) {
    return await getProductsFromFile();
  }
};
