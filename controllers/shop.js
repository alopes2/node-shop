const Product = require('../models/product');
const Cart = require('../models/cart');

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
    pageTitle: product.title,
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

exports.getCart = async (req, res, next) => {
  const cart = await Cart.getCart();
  const products = await Product.fetchAll();
  const cartProducts = [];
  for(let product of products) {
    const cartProductData = cart.products.find(cp => cp.id === product.id);
    if (cartProductData) {
      cartProducts.push({productData: product, qty: cartProductData.qty});
    }
  }

  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart',
    products: cartProducts,
    totalPrice: cart.totalPrice
  });
};

exports.postCart = async (req, res, next) => {
  const prodId = req.body.productId;
  const product = await Product.findById(prodId);

  await Cart.addProduct(product.id, product.price);

  res.redirect('/cart');
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