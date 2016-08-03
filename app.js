const FB = require('fb');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const request = require('request');
const appID = '1789586264586396';
const appSecret = 'c8c9db0ef1c863ecc99f61d1041e662a';
const myCallBackURL = 'https://facebook-posts-bots.azurewebsites.net/auth/facebook/callback/';
const port = process.env.PORT || 80;

app.set('view engine', 'pug');

//facebook-api-bots應用程式
passport.use(new FacebookStrategy({
    clientID: appID,
    clientSecret: appSecret,
    callbackURL: myCallBackURL
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

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', function (req, res) {
    let token = req.user.token; //取得短期accessToken
    let id = req.user.id;
    // res.send(token);

    request('http://x.rce.tw/s/h3584935/get_long_token.php?token=' + token, function (error, response, body) {
        let accessToken = body.split('&')[0].split('=')[1];
        request.post({ url: 'https://graph.facebook.com/v2.7/' + id + '/posts', form: { message: 'testing message', access_token: 'EAACEdEose0cBABVfdWaegFSmJhhEo343H4Px66EPlslVZBuExWQ8nknGNz2PZCKfef4HeRSr5jqDaxmeyos5Qv6FlYPYKYcbplKZCqwvhXmK3Cwvf8ieO3ZCPD8a2tV0PNDRx3yI395vCFYNmspUagI1RjVydVkuNp4vR1sGQQZDZD' } }, function (err, httpResponse, body) {
            if (!err && httpResponse.status == 200) {
                res.send(body);
            } else {
                res.send(err);
            }
        });
    });

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