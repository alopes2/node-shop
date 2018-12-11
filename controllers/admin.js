const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  //res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product'
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product(title, imageUrl, description, price);
  const products = await product.save();
  res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
  // not necessary, as the route is alredy for editing
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  
  const productId = req.params.productId;
  const product = await Product.findById(productId);

  res.render('admin/edit-product', {
    product: product,
    pageTitle: 'Edit Product',
    path: '/admin/products',
    editing: editMode
  });
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.fetchAll();
  res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products'
  });
};
