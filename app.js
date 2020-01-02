const keys = require('./config/keys');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongodDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error.js');

const app = express();
const sessionStore = new MongodDBStore({
  uri: keys.database,
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
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
  res.locals.userRole = req.user ? req.user.role : undefined;

  next();
});

app.use(async (req, res, next) => {
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user._id);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      throw next(e);
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
  res
    .status(500)
    .render('500', {
      pageTitle: 'Internal Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
});

mongoose
  .connect(keys.database)
  .then(result => {
    app.listen(3000, () => {
      console.log('Listening on port 3000');
    });
  })
  .catch(err => {
		throw next(e);
  });
