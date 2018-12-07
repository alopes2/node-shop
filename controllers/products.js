const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  //res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product'
  });
};

exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect('/');
};

exports.getProducts = (req, res, next) => {
  // res.sendFile(path.join(__dirname, '..' ,'views', 'shop.html'));
  // res.sendFile(path.join(rootDir ,'views', 'shop.html'));
  Product.fetchAll(products => {
    console.log(products);
    res.render('shop', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      hasProducts: products.length > 0
    });
  });
};
