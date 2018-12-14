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

	try {
		const result = await Product.create({
			title: title,
			price: price,
			imageUrl: imageUrl,
			description: description
		});
		res.redirect('/admin/products');
	} catch (e) {
		console.log(e);
	}
};

exports.getEditProduct = async (req, res, next) => {
	// not necessary, as the route is alredy for editing
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}

	const productId = req.params.productId;
	const product = await Product.findByPk(productId);
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

	// const product = await Product.findByPk(productId);

	// product.title = updatedTitle;
	// product.price = updatedPrice;
	// product.imageUrl = updatedImageUrl;
	// product.description = updatedDesc;

	// await product.save();
	await Product.update(
		{
			title: updatedTitle,
			price: updatedPrice,
			imageUrl: updatedImageUrl,
			description: updatedDesc
		},
		{ where: { id: productId } }
	);

	res.redirect('/admin/products');
};

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.findAll();
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products'
		});
	} catch (e) {
		console.log(e);
	}
};

exports.postDeleteProduct = async (req, res, next) => {
	const productId = req.body.productId;
	// const product = await Product.findByPk(productId);
	// await product.destroy();
	
	await Product.destroy({ where: { id: productId }});
	res.redirect('/admin/products');
};
