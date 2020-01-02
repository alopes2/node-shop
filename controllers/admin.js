const { validationResult } = require('express-validator');

const { deleteFile } = require('../util/file');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	//res.sendFile(path.join(__dirname, '..', 'views', 'add-product.html'));
	// res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: []
	});
};

exports.postAddProduct = async (req, res, next) => {
	const title = req.body.title;
	const image = req.file;
	const price = req.body.price;
	const description = req.body.description;

	if (!image) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			product: {
				title: title,
				price: price,
				description: description
			},
			errorMessage: 'Attached file is not a valid image.',
			hasError: true,
			validationErrors: []
		});
	}

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			product: {
				title: title,
				price: price,
				description: description
			},
			errorMessage: errors.array()[0].msg,
			hasError: true,
			validationErrors: errors.array()
		});
	}

	const imageUrl = `/${image.path}`;

	const product = new Product({
		title: title,
		price: price,
		imageUrl: imageUrl,
		description: description,
		userId: req.user // For convenience, mongoose fetches the userId from the req.session.user object
	});

	try {
		const newProduct = await product.save();
		res.redirect('/admin/products');
	} catch (e) {
		// return res.status(500).render('admin/edit-product', {
		// 	pageTitle: 'Add Product',
		// 	path: '/admin/add-product',
		// 	editing: false,
		// 	product: {
		// 		title: title,
		// 		imageUrl: imageUrl,
		// 		price: price,
		// 		description: description
		// 	},
		// 	errorMessage: 'Database operation failed, please try again.',
		// 	hasError: true,
		// 	validationErrors: []
		// });

		// return res.status(500).render('/500');

		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
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
		return res.render('/');
	}

	res.render('admin/edit-product', {
		product: product,
		pageTitle: 'Edit Product',
		path: '/admin/products',
		editing: editMode,
		hasError: false,
		errorMessage: null,
		validationErrors: []
	});
};

exports.postEditProduct = async (req, res, next) => {
	const productId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedDesc = req.body.description;
	const updatedImage = req.file;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/products',
			editing: true,
			product: {
				_id: productId,
				title: updatedTitle,
				price: updatedPrice,
				description: updatedDesc
			},
			errorMessage: errors.array()[0].msg,
			hasError: true,
			validationErrors: errors.array()
		});
	}

	try {
		const product = await Product.findById(productId);
		
		if (product.userId.toString() !== req.user._id.toString()) {
			return res.redirect('/admin/products');
		}

		product.title = updatedTitle;
		product.price = updatedPrice;
		product.description = updatedDesc;
		if (updatedImage) {
			console.log(product.imageUrl.replace("/", ""));
			deleteFile(product.imageUrl.replace("/", ""));
			product.imageUrl = `/${updatedImage.path}`;
		}
	
		await product.save();
	
		res.redirect('/admin/products');
	} catch (e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find({ userId: req.user._id }).populate('userId');
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products'
		});
	} catch (e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postDeleteProduct = async (req, res, next) => {
	const productId = req.body.productId;
	
	try {
		const product = await Product.findById(productId);

		if (!product) {
			throw new Error('Product not found.');
		}

		deleteFile(product.imageUrl.replace("/", ""));

		const result = await Product.deleteOne( { _id: productId, userId: req.user._id });

		res.redirect('/admin/products');	
	} catch(e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
};
