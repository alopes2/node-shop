const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');

const User = require('../models/user');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email', 'E-mail is not a valid format.')
      .isEmail()
      .normalizeEmail(),
    body('password', 'Password is not in a valid format.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Invalid email.')
      .custom(async (value, { req }) => {
        //Dummy logic to show custom validators
        // if (value === 'invalid@test.com') {
        //   throw new Error('This email address is forbidden.');
        // }

        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error('E-mail already exists.');
        }

        return true;
      }),
    body(
      'password',
      'Password should be only text and numbers and have at least 5 characters.'
    )
      .trim()
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body('confirmPassword', 'Password does not match.')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return false;
        }

        return true;
      })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
