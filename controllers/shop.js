const Product = require('../models/product');

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.fetchAll();

		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All products',
			path: '/products'
		});
	} catch (e) {
		console.log(e);
	}
};

exports.getProduct = async (req, res, next) => {
	const prodId = req.params.productId;
	try
	{
		const product = await Product.findById(prodId);
		res.render('shop/product-detail', {
			product: product,
			pageTitle: product.title,
			path: '/products'
		});
	}
	catch(e)
	{
		console.log(e);
	}
};

exports.getIndex = async (req, res, next) => {
	try {
		const products = await Product.fetchAll();
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/'
		});
	} catch (e) {
		console.log(e);
	}
};

exports.getCart = async (req, res, next) => {
	const products = await req.user.getCart();

	res.render('shop/cart', {
		path: '/cart',
		pageTitle: 'Your Cart',
		products: products
	});
};

exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId;

	try {

		const product = await Product.findById(prodId);

		const result = await req.user.addToCart(product);

		res.redirect('/cart');
	} catch (e) {
		console.log(e);
	}
};

exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId;
	const products = await req.user.deleteItemFromCart(prodId);

	res.redirect('/cart');
};

exports.postOrder = async (req, res, next) => {
	try {
		const order = await req.user.addOrder();
		res.redirect('/orders');
	} catch (e) {
		console.log(e);
	}
};

exports.getOrders = async (req, res, next) => {
	try {
		const orders = await req.user.getOrders();
		res.render('shop/orders', {
			path: '/orders',
			pageTitle: 'Your Orders',
			orders: orders
		});
	} catch(e) {
		console.log(e);
	}
};
