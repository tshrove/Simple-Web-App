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
var User = require('../datastructures/userSchema');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('users');
});

/**
 * Get user data for the dataTable.
 */
router.get('/data', function (req, res, next) {
    try {
        var start = req.query.start;
        var length = req.query.length;
        var search = req.query.search.value;

        User.find()
            .or([
                {'email': new RegExp(search, 'i')},
                {'firstName': new RegExp(search, 'i')},
                {'lastName': new RegExp(search, 'i')}
            ])
            .skip(start)
            .limit(length)
            .exec(function (err, results) {
                if (err) {
                    console.log('error - ' + err.message)
                }
                var output = {
                    draw: req.query.draw,
                    recordsTotal: results.length,
                    recordsFiltered: results.length,
                    data: results
                };
                res.send(output);
            });
    } catch (ex) {
        console.log(ex);
    }
});

/**
 * Gets the user modeal information to fill the edit modal.
 */
router.get('/modalData', function (req, res, next) {
    var userId = req.query.id;
    if (userId !== null) {
        Organization.find({}, function (err, organizations) {
            User.findOne({'_id': userId}, function (err, user) {
                if (err) {
                    res.send('<h1>Error</h1>');
                }
                res.render('userModel', { user: user, organizations: organizations });
            });
        });
    }
});

/**
 * Update the user information.
 */
router.post('/updateUser', function (req, res, next) {
    try {
        var id = req.body.id;
        var email = req.body.email;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var role = req.body.role;
        var org = req.body.org;
        if (email && firstName && lastName && role) {
            User.findByIdAndUpdate(id, {
                $set: {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    role: role,
                    orgId: org
                }
            }, function (err) {
                if (err) {
                    var err = {
                        error: 'Error trying to update user.'
                    };
                    res.send(err);
                }

                var successMsg = {
                    message: "Successfully updated user."
                }
                res.send(successMsg);
            });
        } else {
            var err = {
                error: 'Error trying to update user.'
            };
            res.send(err);
        }
    } catch (ex) {
        var err = {
            error: ex.message
        };
        res.send(err);
    }
});

module.exports = router;
