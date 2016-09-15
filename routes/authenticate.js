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
var router = express.Router();
var bcrypt = require('bcrypt');
var settings = require('../settings');
//var mongoClient = require('mongodb').MongoClient;
var User = require('../datastructures/userSchema');
var passport = require('../datastructures/passport');
var authHelper = require('../datastructures/authenticationHelper');

/**
 * Login View
 */
router.get('/login', function (req, res, next) {
    res.render('login');
});

/**
 * Post methods that occurs when the login action happens.
 */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/auth/login',
    failureFlash: true }));

/**
 * Logout View.
 */
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

/**
 * Displays the register view.
 */
router.get('/register', function (req, res, next) {
    res.render('register');
});

/**
 * Action that happens on the register button clicked on the register page.
 */
router.post('/register', function (req, res, next) {
        if (req.body != null) {
            var sEmail = req.body.email;
            var sPass = req.body.pass;
            var sPass2 = req.body.pass2;
            var sFName = req.body.fname;
            var sLName = req.body.lname;
            // Got all the varilables.
            if (sEmail && sPass && sPass2 && sFName && sLName) {
                // double check to see if both passwords match.
                if (sPass === sPass2) {
                    // Hash the password.
                    bcrypt.hash(sPass, settings.hashCount, function (err, hash) {
                        if (err) {
                            error(res, 100, err.message);
                        }
                        var registeredUser = new User({
                            email: sEmail,
                            firstName: sFName,
                            lastName: sLName,
                            role: "None",
                            pwHash: hash
                        });

                        registeredUser.save(function(err) {
                            if (err) {
                                error(res, 110, err.message);
                            }

                            res.redirect('/auth/login?success=created account successfully');
                        });
                    });
                } else {
                    error(res, 20, "passwords do not match.");
                }
            } else {
                error(res, 10, "request body is empty");
            }
        } else {
            error(res, 0, "request body is empty");
        }
    }
);

/**
 * Private Methods
 */
function error(res, code, text) {
    res.render('register', { error: {
            code: code,
            message: text
        }
    });
};

module.exports = router;
