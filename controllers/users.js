const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register.ejs');
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Arcade Atlas');
            res.redirect('/checkpoints');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }

}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = res.locals.returnTo || '/checkpoints';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye');
        res.redirect('/checkpoints');
    });
}