const express = require('express');

const { isAuth, requireRole } = require('../middlewares/auth');
const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, requireRole('admin'), adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, requireRole('admin'), adminController.getProducts);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, requireRole('admin'), adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product', isAuth, requireRole('admin'), adminController.postEditProduct);

// /admin/add-product => POST
router.post('/add-product', isAuth, requireRole('admin'), adminController.postAddProduct);

// /admin/add-product => POST
router.post('/delete-product', isAuth, requireRole('admin'), adminController.postDeleteProduct);

module.exports = router;