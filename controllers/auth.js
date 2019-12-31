const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const keys = require('../config/keys');
const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: keys.sendGridApiKey // this key is generated in settings in sendgrid
    }
  })
);

exports.getLogin = (req, res, next) => {
  let errorMessage;

  const errors = req.flash('error');
  if (errors.length > 0) {
    errorMessage = errors[0];
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: errorMessage,
    oldInput: {},
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let errorMessage;

  const errors = req.flash('error');
  if (errors.length > 0) {
    errorMessage = errors[0];
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: errorMessage,
    oldInput: {},
    validationErrors: []
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        req.session.user = user;
        req.session.isLoggedIn = true;

        const result = await req.session.save();

        return res.redirect('/');
      }
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    } catch (compareError) {
      console.log(compareError);
      res.redirect('/login');
    }
  } catch (e) {
    console.log(e);
  }
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] }
    });

    await user.save();

    res.redirect('/login');

    var result = await transporter.sendMail({
      to: email,
      from: 'shop@node-complete.com',
      subject: 'Signup Succeeded!',
      html: '<h1>You succcessfully signed up!</h1>'
    });
  } catch (e) {
    console.log(e);
  }
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getReset = async (req, res, next) => {
  let errorMessage;

  const errors = req.flash('error');
  if (errors.length > 0) {
    errorMessage = errors[0];
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: errorMessage
  });
};

exports.postReset = async (req, res, next) => {
  const email = req.body.email;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash('error', 'No user found with this email.');
      return res.redirect('/reset');
    }

    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect('/reset');
      }
      const token = buffer.toString('hex');
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;

      await user.save();

      res.redirect('/');

      var result = await transporter.sendMail({
        to: req.body.email,
        from: 'shop@node-complete.com',
        subject: 'Password reset',
        html: `
                    <p>You requested a password reset.</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `
      });
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now()
    }
  });

  let errorMessage;

  const errors = req.flash('error');
  if (errors.length > 0) {
    errorMessage = errors[0];
  }

  res.render('auth/new-password', {
    path: '/new-password',
    pageTitle: 'New Password',
    errorMessage: errorMessage,
    userId: user._id.toString(),
    passwordToken: token
  });
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Invalid token or token expired.');
      return res.redirect('/reset');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedNewPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.redirect('/login');
  } catch (e) {
    console.log(e);
  }
};
