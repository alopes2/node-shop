const keys = require('../config/keys');
const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(keys.stripe); //secret key from stripe

const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 1;
const DEFAULT_PAGE = 1;

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || DEFAULT_PAGE;

  try {
    const numberOfProducts = await Product.find().countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
      
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All products',
      path: '/products',
      currentPage: page,
      hasNextPage: (ITEMS_PER_PAGE * page) < numberOfProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(numberOfProducts / ITEMS_PER_PAGE)
    });
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || DEFAULT_PAGE;
  try {
    const numberOfProducts = await Product.find().countDocuments();

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
      
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: (ITEMS_PER_PAGE * page) < numberOfProducts,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(numberOfProducts / ITEMS_PER_PAGE)
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

exports.getCheckout = async (req, res, next) => {
  const user = await req.user.populate('cart.items.productId').execPopulate();
  const products = user.cart.items;

  const totalSum = products.reduce((acc, p) => acc + (p.quantity * p.productId.price), 0);

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: products.map(p => {
      return {
        name: p.productId.title,
        description: p.productId.description,
        amount: p.productId.price * 100,
        currency: 'usd',
        quantity: p.quantity
      }
    }),
    success_url: `${req.protocol}://${req.get('host')}/checkout/success`, // http://localhost:3000 ...
    cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`, // http://localhost:3000 ...
  });

  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
    products: products,
    totalSum: totalSum,
    sessionId: stripeSession.id
  });
};

exports.getCheckoutSuccess = async (req, res, next) => {
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
  } catch (e) {
    const error = new Error(e);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('No order found.');
    }

    if (order.user.userId.toString() !== req.user._id.toString()) {
      throw new Error('Unauthorized.');
    }

    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoiceName}"`
    ); //inline instead of attachment opens the file in the browser
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', { underline: true });
    pdfDoc.text('------------------------------------------');

    let totalPrice = 0;
    for (let prodData of order.products) {
      totalPrice += prodData.quantity * prodData.product.price;
      pdfDoc
        .fontSize(14)
        .text(
          prodData.product.title +
            ' - ' +
            prodData.quantity +
            ' x $' +
            prodData.product.price
        );
    }
    pdfDoc.text('---');
    pdfDoc.fontSize(20).text('Total price: $' + totalPrice);

    pdfDoc.end();

    // res.download(invoicePath);

    //  const file = fs.createReadStream(invoicePath);
    // 	res.setHeader('Content-Type', 'application/pdf');
    // 	res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`); //inline instead of attachment opens the file in the browser
    // 	file.pipe(res);

    // fs.readFile(invoicePath, (err, data) => {
    // 	if (err) {
    // 		return next(e);
    // 	}
    // 	res.setHeader('Content-Type', 'application/pdf');
    // 	res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`); //inline instead of attachment opens the file in the browser
    // 	res.send(data);
    // });

    // const invoicePath = path.resolve('data', 'invoices', invoiceName);
    // res.sendFile(invoicePath);
  } catch (e) {
    next(e);
  }
};
