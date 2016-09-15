// MIT License
//
// Copyright (c) [2016] [Tommy Shrove]
// Twitter: @tshrove
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
//     The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
//     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var settings = require('./settings');
var connectSession = require('connect-mongodb-session')(session);
var passport = require('passport');
var flash = require('connect-flash');
var authHelper = require('./datastructures/authenticationHelper');
var mongoose = require('mongoose');

// Connect the views
var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/authenticate');
var home = require('./routes/home');

// Connect to the session storage.
var store = new connectSession({
    uri: settings.mongoDbUrl,
    collection: 'sessions'
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to session
app.use(session({
    name: 'server-session-cookie-id',
    secret: settings.sessionSecret,
    saveUninitialized: true,
    resave: true,
    store: store
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Connect to the write database.
mongoose.connect(settings.mongoDbUrl);

app.use('/', routes);
app.use('/users', authHelper.ensureAuthentication, authHelper.loadUser, users);
app.use('/auth', authHelper.loadUser, auth);
app.use('/home', authHelper.ensureAuthentication, authHelper.loadUser, home);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
