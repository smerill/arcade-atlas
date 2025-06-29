const express = require('express');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const passport = require('passport');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('users/register.ejs');
});

router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'goodbye');
        res.redirect('/checkpoints');
    });
});

router.post('/register', catchAsync(async (req, res, next) => {
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

}));

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = res.locals.returnTo || '/checkpoints';
    res.redirect(redirectUrl);
});

module.exports = router;