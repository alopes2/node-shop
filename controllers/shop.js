const Product = require('../models/product');

exports.getProducts = async (req, res, next) => {
  // res.sendFile(path.join(__dirname, '..' ,'views', 'shop.html'));
  // res.sendFile(path.join(rootDir ,'views', 'shop.html'));
  const products = await Product.fetchAll();
  res.render('shop/product-list', {
    prods: products,
    pageTitle: 'All products',
    path: '/products'
  });
};

exports.getIndex = async (req, res, next) => {
  // res.sendFile(path.join(__dirname, '..' ,'views', 'shop.html'));
  // res.sendFile(path.join(rootDir ,'views', 'shop.html'));
  const products = await Product.fetchAll();
  res.render('shop/index', {
    prods: products,
    pageTitle: 'Shop',
    path: '/'
  });
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};