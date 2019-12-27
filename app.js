const express = require('express');
const keys = require('./config/keys');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');


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
	User.findById('5e05ce7e1aa7a854d0e4d827')
		.then(user => {
			req.user = user;
			next();
		})
		.catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
	
mongoose
	.connect(keys.database)
	.then(result => {
		User.findOne()
			.then(user => {
				if (!user) {
					const user = new User({
						name: 'Andre',
						email: 'andre@test.com',
						cart: {
							items: []
						}
					});

					user.save();
				}
			});

		app.listen(3000, () => {
			console.log('Listening on port 3000');
		});
	})
	.catch(err => {
		console.log(err);
	});
