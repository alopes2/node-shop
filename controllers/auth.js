const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
    	path: '/login',
    	pageTitle: 'Login',
		isAuthenticated: req.session.isLoggedIn
    });
};

exports.postLogin = async (req, res, next) => {
    const user = await User.findOne();

    req.session.user = user;
    req.session.isLoggedIn = true;

    const result = await req.session.save();
    
    res.redirect('/');
};

exports.postLogout = async (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};