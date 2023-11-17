const express = require('express');
const router = express.Router();
const User = require('../models/users');
const asyncCatch = require('../utils/asyncCatch');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');


router.post('/register', asyncCatch(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) { return next(err); }
            req.flash('success', 'succesfully registered to campgrounds');
            res.redirect('/campgrounds')
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
}))

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.get('/login', (req, res) => {
    console.log(passport);
    res.render('users/login');
})

// router.post('/login', passport.authenticate('local', passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}), (req, res) => {
//     console.log('inside router.post(/login');
//     req.flash('success',  'succesfully logged in');
//     res.redirect('/campgrounds');
//     res.send('jo');
// }))

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {

    req.flash('success', 'succesfully logged in');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});


module.exports = router;