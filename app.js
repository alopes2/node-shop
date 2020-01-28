const keys = require('./config/keys');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error.js');

const app = express();
const sessionStore = new MongodDBStore({
  uri: keys.mongoUri,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: keys.sessionSecret, // this is a normal string, for dev purpose can be anything
    resave: false,
    saveUninitialized: false,
    store: sessionStore
  })
);
app.use(csrf());
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});

app.use(async (req, res, next) => {
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user._id);
      if (user) {
        req.user = user;
        res.locals.userRole = req.user.role;
      }
    } catch (e) {
      next(e);
    }
  }

  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res
    .status(500)
    .render('500', {
      pageTitle: 'Internal Error!',
      path: '/500',
      userRole: req.user ? req.user.role : null,
      csrfToken: req.csrfToken(),
      isAuthenticated: req.session.isLoggedIn
    });
});

mongoose
  .connect(keys.mongoUri)
  .then(result => {
    app.listen(3000, () => {
      console.log('Listening on port 3000');
    });
  })
  .catch(err => {
		throw next(e);
  });
