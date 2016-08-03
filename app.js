const FB = require('fb');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const app = express();
const port = process.env.PORT || 80;

app.set('view engine', 'pug');

//facebook-api-bots應用程式
passport.use(new FacebookStrategy({
    clientID: '1789586264586396',
    clientSecret: 'c8c9db0ef1c863ecc99f61d1041e662a',
    callbackURL: 'https://facebook-posts-bots.azurewebsites.net/auth/facebook/callback/'
},
    function (accessToken, refreshToken, profile, cb) {
        var user = {
            'id': profile.id,
            'token': accessToken
        };
        return cb(null, user);
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', function (req, res) {
    console.log(req.user.token); //取得userAccessToken
    var accessToken = req.user.token;
    FB.setAccessToken(accessToken);
    var message = 'Hi from facebook-node-sdk';
    FB.api('', 'post', {
        batch: [
            { method: 'post', relative_url: 'me/feed', body: 'message=' + encodeURIComponent(message) }
        ]
    }, function (response) {
        var res0;

        if (!response || response.error) {
            res.send(!response ? 'error occurred' : response.error);
            return;
        }

        res0 = JSON.parse(response[0].body);

        if (res0.error) {
            res.send(res0.error);
        } else {
            res.send('Post Id: ' + res0.id);
        }
    });
    // res.render('home', { username: req.user.token });
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
    res.redirect('/');
});

app.listen(port, function () {
    console.log('listening on port ' + port);
});