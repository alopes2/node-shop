const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
	User.findById('5e01e0101c9d4400009032ee')
		.then(user => {
			req.user = new User(user.name, user.email, user.cart, user._id);
			next();
		})
		.catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
	
mongoConnect(() => {
	app.listen(3000, () => {
		console.log('Listening on port 3000');
	});
});
