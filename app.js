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
const port = process.env.PORT || 80;

app.set('view engine', 'pug');

//facebook-api-bots應用程式
passport.use(new FacebookStrategy({
    clientID: appID,
    clientSecret: appSecret,
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

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    //console.log(req.user.token); //取得userAccessToken
    var token = req.user.token; //取得短期accessToken
    var id = req.user.id;
    var accessToken = '';
    request('https://graph.facebook.com/oauth/access_token?client_id=' + appID + '&client_secret=' + appSecret + '&fb_exchange_token=' + token, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            accessToken = body.split('&')[0].split('=')[1]; //取得長期60天accessToken
            request.post({
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: 'graph.facebook.com/' + id + '/feed',
                body: 'message=' + 'testing' + '&access_token=' + accessToken
            }, function (error, response, body) {
                res.send(body);
            });
        }
    });

    // FB.setAccessToken('EAACEdEose0cBAJmADEJzGfku5zKa4tzrR7JFKc4HmJ41VG5WcEaR2SA6DevNC6y9hasmPykIqtEoQiHrcGjONXlWne5BGufZASFp22SunefxZBY2qgZAtUkHHScT4AD6G8ZAFZCok9KYmEMnXlfWkeDHib94SEcLspW96rrHLiQZDZD');
    // var body = 'My first post using facebook-node-sdk';
    // FB.api(req.user.id + '/feed', 'post', { message: body }, function (response) {
    //     if (!response || response.error) {
    //         res.send(!response ? 'error occurred' : response.error);
    //         return;
    //     }
    //     res.send('Post Id: ' + response.id);
    // });

    // request('graph.facebook.com/' + req.user.id + '/feed');

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