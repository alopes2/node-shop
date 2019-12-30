const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const keys = require('../config/keys');
const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: keys.sendGridApiKey // this key is generated in settings in sendgrid
    }
}));

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
        const user = await User.findOne({email: email});
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