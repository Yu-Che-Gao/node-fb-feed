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
const schedule = require('node-schedule');
const timeZone = require('./timezone.js');
const mysql = require('./dbcon.js');
const appID = '1789586264586396';
const appSecret = 'c8c9db0ef1c863ecc99f61d1041e662a';
const myCallBackURL = 'https://facebook-posts-bots.azurewebsites.net/auth/facebook/callback/';
const port = process.env.PORT || 80;
var accessToken = ''; //長期accessToken暫存區
var userID = '';

app.set('view engine', 'pug');

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
    if (req.user == undefined) {
        app.redirect('/login');
    }
    let token = req.user.token; //取得短期accessToken
    let id = req.user.id; //取得userID

    request('http://x.rce.tw/s/h3584935/get_long_token.php?token=' + token, function (error, response, body) {
        accessToken = body.split('&')[0].split('=')[1]; //取得長期accessToken
        userID = id; //存入userID
        // FB.setAccessToken('EAACEdEose0cBAB6YJtqXmy4zOfcMdHsol96FsF6rMIBtzICSEP0AS3ZBTQctSP1GQmuG3xCfaZBvG1EMmTtuJGn4ZCFm8Qcy3XLeNMLkZAs3dJmWinabWmKXp6np9iK3tDAggiXNB6ZCfrEph46lKe0BOYSBfpiqPzRiWRUwKGQZDZD');
        // let myMessage = 'My first post using facebook-node-sdk';
        // FB.api('me/feed', 'post', { message: myMessage }, function (response) {
        //     if (!response || response.error) {
        //         // res.send(!response ? 'error occurred' : response.error);
        //         return;
        //     }
        //     // res.send('Post Id: ' + response.id);
        // });
    });

    res.render('index', { title: '自動發文系統' });

});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
    res.redirect('/');
});

app.get('/index', function (req, res) {
    res.redirect('/');
});

app.post('/index/feed', function (req, res) {
    let dt = timeZone.getTimeZone(8);
    let strdate1 = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    let sql = "INSERT INTO `pofeed`(`Fb_id`, `token`, `content`, `po_time`, `get_time`) VALUES ('" + userID + "','" + accessToken + "','" + req.body.description + "','" + req.body.date + " " + req.body.time + "','" + strdate1 + "')";
    mysql.getInsert(sql);
    res.redirect('/index');
});

app.listen(port, function () {
    console.log('listening on port ' + port);
});
