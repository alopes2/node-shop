const express = require('express');
const { body, check } = require('express-validator');
const upload = require('multer');

const { isAuth, requireRole } = require('../middlewares/auth');
const adminController = require('../controllers/admin');

const router = express.Router();

const fileStorage = upload.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const acceptedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  cb(null, acceptedTypes.includes(file.mimetype));
};

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
  upload({ storage: fileStorage, fileFilter: fileFilter }).single('image'),
  [
    body('title', 'Invalid title.')
      .trim()
      .isString()
      .isLength({ min: 3 }),
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
  upload({ storage: fileStorage, fileFilter: fileFilter }).single('image'),
  [
    body('title', 'Invalid title.')
      .trim()
      .isString()
      .isLength({ min: 3 }),
    body('price', 'Invalid price.').isFloat(),
    body('description', 'Invalid description.')
      .trim()
      .isLength({ min: 5, max: 400 })
  ],
  adminController.postAddProduct
);

// /admin/product/123 => DELETE
router.delete('/product/:productId', isAuth, requireRole('admin'), adminController.deleteProduct);

module.exports = router;
