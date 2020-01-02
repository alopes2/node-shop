const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.find();

		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All products',
			path: '/products'
		});
	} catch (e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
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
		const products = await Product.find();
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/'
		});
	} catch (e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getCart = async (req, res, next) => {
	const user = await req.user.populate('cart.items.productId').execPopulate();

	res.render('shop/cart', {
		path: '/cart',
		pageTitle: 'Your Cart',
		products: user.cart.items
	});
};

exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId;

	try {
		const product = await Product.findById(prodId);

		const result = await req.user.addToCart(product);

		res.redirect('/cart');
	} catch (e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId;
	const result = await req.user.removeFromCart(prodId);

	res.redirect('/cart');
};

exports.postOrder = async (req, res, next) => {
	try {
		const user = await req.user.populate('cart.items.productId').execPopulate();

		const products = user.cart.items.map(i => {
			return { quantity: i.quantity, product: { ...i.productId._doc } };
		});

		const order = new Order({
			user: {
				email: req.user.email,
				userId: req.user._id
			},
			products: products
		});

		await order.save();
		
		await req.user.clearCart();

		res.redirect('/orders');
	} catch (e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getOrders = async (req, res, next) => {
	try {
		const orders = await Order.find({ 'user.userId': req.user._id });

		res.render('shop/orders', {
			path: '/orders',
			pageTitle: 'Your Orders',
			orders: orders
		});
	} catch(e) {
		const error = new Error(e);
		error.httpStatusCode = 500;
		return next(error);
	}
};
