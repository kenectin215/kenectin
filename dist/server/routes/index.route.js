'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _user = require('./user.route');

var _user2 = _interopRequireDefault(_user);

var _auth = require('./auth.route');

var _auth2 = _interopRequireDefault(_auth);

var _post = require('./post.route');

var _post2 = _interopRequireDefault(_post);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _httpStatus = require('http-status');

var _httpStatus2 = _interopRequireDefault(_httpStatus);

var _user3 = require('../models/user.model');

var _user4 = _interopRequireDefault(_user3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('../../config/env');
var router = _express2.default.Router(); // eslint-disable-line new-cap


// mount auth routes at /auth
router.use('/auth', _auth2.default);

/** GET /health-check - Check service health */
router.get('/health-check', function (req, res) {
    return res.send('OK');
});

router.use('*', function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        _jsonwebtoken2.default.verify(token, config.jwtSecret, function (err, decoded) {
            if (err) {
                return res.json({
                    result: 1,
                    token: token,
                    data: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                _user4.default.get(req.decoded.id).then(function (user) {
                    req.current_user = user;
                    next();
                }).catch(function (err) {
                    res.json({
                        result: 1,
                        data: "Invalid or expired token"
                    });
                });
            }
        });
    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

// mount user routes at /users
router.use('/post', _post2.default);
router.use('/user', _user2.default);
exports.default = router;
module.exports = exports['default'];
//# sourceMappingURL=index.route.js.map
