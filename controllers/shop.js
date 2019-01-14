const Product = require('../models/product');

exports.getProducts = async (req, res, next) => {
	try {
		const products = await Product.findAll();

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
	// const product = await Product.findAll({where: { id: prodId}}); Returns an array of products
	const product = await Product.findByPk(prodId);
	res.render('shop/product-detail', {
		product: product,
		pageTitle: product.title,
		path: '/products'
	});
};

exports.getIndex = async (req, res, next) => {
	try {
		const products = await Product.findAll();
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
	// const cart = await Cart.getCart();
	// const products = await Product.fetchAll();
	// const cartProducts = [];
	// for(let product of products) {
	//   const cartProductData = cart.products.find(cp => cp.id === product.id);
	//   if (cartProductData) {
	//     cartProducts.push({productData: product, qty: cartProductData.qty});
	//   }
	// }

	const cart = await req.user.getCart();

	const cartProducts = await cart.getProducts();
	console.log(cartProducts);
	res.render('shop/cart', {
		path: '/cart',
		pageTitle: 'Your Cart',
		products: cartProducts,
		totalPrice: cart.totalPrice
	});
};

exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId;
	try {
		const cart = await req.user.getCart();

		const products = await cart.getProducts({ where: { id: prodId } });

		let product;
		if (products.length > 0) {
			product = products[0];
		}

		let newQuantity = 1;
		if (product) {
			const oldQuantity = product.cartItem.quantity;
			newQuantity = oldQuantity + 1;
		} else {
			product = await Product.findById(prodId);
		}

		try {
			await cart.addProduct(product, {
				through: { quantity: newQuantity }
			});
		} catch (e) {
			console.log(e);
		}

		res.redirect('/cart');
	} catch (e) {
		console.log(e);
	}
};

exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId;
	const cart = await req.user.getCart();
	const products = await cart.getProducts({ where: { id: prodId } });
	const product = products[0];

	const result = await product.cartItem.destroy();

	res.redirect('/cart');
};

exports.postOrder = async (req, res, next) => {
	const cart = await req.user.getCart();
	const products = await cart.getProducts();

	try {
		const order = await req.user.createOrder();
		await order.addProducts(
			products.map(product => {
				product.orderItem = {
					quantity: product.cartItem.quantity
				};
				return product;
			})
		);
		await cart.setProducts(null);
		res.redirect('/orders');
	} catch (e) {
		console.log(e);
	}
};

exports.getOrders = async (req, res, next) => {
	const orders = await req.user.getOrders({ include: ['products'] });
	res.render('shop/orders', {
		path: '/orders',
		pageTitle: 'Your Orders',
		orders: orders
	});
};
