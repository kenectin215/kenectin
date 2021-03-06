import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import postRoutes from './post.route';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import User from '../models/user.model';

const config = require('../../config/env');
const router = express.Router(); // eslint-disable-line new-cap


// mount auth routes at /auth
router.use('/auth', authRoutes);

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
    res.send('OK')
);

router.use('*', function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.jwtSecret, function(err, decoded) {
            if (err) {
                return res.json({
                    result: 1,
                    token: token,
                    data: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                User.get(req.decoded.id)
                    .then(function(user) {
                        req.current_user = user;
                        next();
                    })
                    .catch((err) => {
                        res.json({
                            result:1,
                            data:"Invalid or expired token"
                        })
                    })
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
router.use('/post', postRoutes);
router.use('/user', userRoutes);
export default router;