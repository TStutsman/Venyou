const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

router.get('/', async (req, res) => {
    const { user: unsafe } = req;

    if(!unsafe) return res.json({ user: null });

    const user = {
        id: unsafe.id,
        firstName: unsafe.firstName,
        lastName: unsafe.lastName,
        email: unsafe.email,
        username: unsafe.username
    }

    res.json(user);
});

const validateLogin = [
    check('credential').exists({ checkFalsy: true }).notEmpty()
    .withMessage('Please provide a valid email or username.'),
    check('password').exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
    handleValidationErrors
];

router.post('/', validateLogin, async (req, res, next) => {
    const { credential, password } = req.body;

    const where = credential.includes('@') ? { email : credential } : { username : credential };

    const unsafe = await User.unscoped().findOne({
        where,
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'hashedPassword']
    });

    if(!unsafe || !bcrypt.compareSync(password, unsafe.hashedPassword.toString())) {
        const err = new Error('Login failed');
        err.title = 'Login failed';
        err.errors = { credentials: 'The provided credentials were invalid.' };
        err.status = 401;
        return next(err);
    }

    const user = {
        id: unsafe.id,
        firstName: unsafe.firstName,
        lastName: unsafe.lastName,
        email: unsafe.email,
        username: unsafe.username
    }
    
    await setTokenCookie(res, user);
    
    res.json({
        user
    })
});

router.delete('/', async (_req, res) => {
    res.clearCookie('token');
    return res.json({
        message: 'success'
    });
});

module.exports = router;