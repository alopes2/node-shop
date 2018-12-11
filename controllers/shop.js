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

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  res.render('shop/product-detail', {
    product: product,
    pageTitle: 'Product Details',
    path: '/product-detail'
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

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};