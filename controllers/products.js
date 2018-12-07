const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  //res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product'
  });
};

exports.postAddProduct = async (req, res, next) => {
  const product = new Product(req.body.title);
  const products = await product.save();
  res.redirect('/');
};

exports.getProducts = async (req, res, next) => {
  // res.sendFile(path.join(__dirname, '..' ,'views', 'shop.html'));
  // res.sendFile(path.join(rootDir ,'views', 'shop.html'));
  const products = await Product.fetchAll();
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'Shop',
    path: '/',
    hasProducts: products.length > 0
  });
};
