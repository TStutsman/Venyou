const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };
    const token = jwt.sign(
        { data: safeUser },
        secret,
        { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return token;
};

const restoreUser = (req, res, next) => {
    const { token } = req.cookies;

    const verified = jwt.verify(token, secret, null, async (err, payload) => {
        if (err) {
            return next();
        }

        const { id } = payload.data;
        const user = await User.findByPk(id, {
            attributes: {
                include: ['email', 'createdAt', 'updatedAt']
            }
        });

        if(!user) res.clearCookie('token');
        else req.user = user;

        return next();
    });

    return verified;
};

const requireAuth = function (req, _res, next) {
    if (req.user) return next();
  
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    // err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
};

module.exports = { setTokenCookie, restoreUser, requireAuth };