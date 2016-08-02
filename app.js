const FB = require('fb');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const app = express();
FB.setAccessToken('EAACEdEose0cBAPMz24pSaytmOGaE99NBU6rydAbdKLP5AJ4ZBUfv5gBZABCkhDQoO5S730h6UZCrSQpEH5MoEqT3LQKJnHod3ndc0NE4BBBMVSjTr3fKqSemnodNfNtYZCopZAGRMNeGdQYhs7hsyS7eWVDYZCUn3ASuFVmyTNBQZDZD');

var message = 'Hi from facebook-node-sdk';
// FB.api({ method: 'stream.publish', message: message }, function (res) {
//     if(!res || res.error_msg) {
//         console.log(!res ? 'error occurred' : res.error_msg);
//         return;
//     }

//     console.log(res);
// });


app.set('view engine', 'pug');

//facebook-api-bots應用程式
passport.use(new FacebookStrategy({
    clientID: '1789586264586396',
    clientSecret: 'c8c9db0ef1c863ecc99f61d1041e662a',
    callbackURL: 'https://facebook-posts-bots.azurewebsites.net/auth/facebook/callback/'
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ facebookId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get('/', function (req, res) {
    res.render('home', { user: req.user });
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
    res.redirect('/');
});