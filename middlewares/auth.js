exports.isAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }

    next();
};

exports.requireRole = requiredRole => {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            throw new Error('Permission denied');
        }
        
        next();
    }
}