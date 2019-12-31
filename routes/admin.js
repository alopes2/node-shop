const express = require('express');
const { body } = require('express-validator');

const { isAuth, requireRole } = require('../middlewares/auth');
const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get(
  '/add-product',
  isAuth,
  requireRole('admin'),
  adminController.getAddProduct
);

// /admin/products => GET
router.get(
  '/products',
  isAuth,
  requireRole('admin'),
  adminController.getProducts
);

// /admin/edit-product => GET
router.get(
  '/edit-product/:productId',
  isAuth,
  requireRole('admin'),
  adminController.getEditProduct
);

// /admin/edit-product => POST
router.post(
  '/edit-product',
  isAuth,
  requireRole('admin'),
  [
    body('title', 'Invalid title.')
      .trim()
      .isString()
      .isLength({ min: 3 }),
    body('imageUrl', 'Invalid image Url.')
      .trim()
      .isURL(),
    body('price', 'Invalid price.').isFloat(),
    body('description', 'Invalid description.')
      .trim()
      .isLength({ min: 5, max: 400 })
  ],
  adminController.postEditProduct
);

// /admin/add-product => POST
router.post(
  '/add-product',
  isAuth,
  requireRole('admin'),
  [
    body('title', 'Invalid title.')
      .trim()
      .isString()
      .isLength({ min: 3 }),
    body('imageUrl', 'Invalid image Url.')
      .trim()
      .isURL(),
    body('price', 'Invalid price.').isFloat(),
    body('description', 'Invalid description.')
      .trim()
      .isLength({ min: 5, max: 400 })
  ],
  adminController.postAddProduct
);

// /admin/add-product => POST
router.post(
  '/delete-product',
  isAuth,
  requireRole('admin'),
  adminController.postDeleteProduct
);

module.exports = router;
