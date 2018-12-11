const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  //res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product(null, title, imageUrl, description, price);
  const products = await product.save();
  res.redirect('/admin/products');
};

exports.getEditProduct = async (req, res, next) => {
  // not necessary, as the route is alredy for editing
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }

  const productId = req.params.productId;
  const product = await Product.findById(productId);
  if (!product) {
    return res.redirect('/');
  }

  res.render('admin/edit-product', {
    product: product,
    pageTitle: 'Edit Product',
    path: '/admin/products',
    editing: editMode
  });
};

exports.postEditProduct = async (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const updateProduct = new Product(
    productId,
    updatedTitle,
    updatedImageUrl,
    updatedDesc,
    updatedPrice
  );

  await updateProduct.save();

  res.redirect('/admin/products');
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.fetchAll();
  res.render('admin/products', {
    prods: products,
    pageTitle: 'Admin Products',
    path: '/admin/products'
  });
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  await Product.deleteById(productId);
  res.redirect('/admin/products');
};
