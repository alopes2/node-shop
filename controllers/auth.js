const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    let errorMessage;

    const errors = req.flash('error');
    if (errors.length > 0) {
        errorMessage = errors[0];
    }

    res.render('auth/login', {
    	path: '/login',
        pageTitle: 'Login',
        errorMessage: errorMessage
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
        errorMessage: errorMessage
    });
};

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        try {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                req.session.user = user;
                req.session.isLoggedIn = true;
            
                const result = await req.session.save();
                
                return res.redirect('/');
            }

            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        } catch(compareError) {
            console.log(compareError);
            res.redirect('/login');
        }
    } catch(e) {
        console.log(e);
    }
};

exports.postSignup = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    try {
        const existingUser = await User.findOne({email: email});
        if (existingUser) {
            req.flash('error', 'E-mail already exists.');
            return res.redirect('/signup');
        }

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
        });

        await user.save();

        res.redirect('/login');
    } catch (e) {
        console.log(e);
    }
};

exports.postLogout = async (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
