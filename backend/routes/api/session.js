const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

router.get('/', async (req, res) => {
    const { user: unsafe } = req;

    if(!unsafe) return res.json({ user: null });

    const user = {
        id: unsafe.id,
        username: unsafe.username,
        email: unsafe.email
    }

    res.json(user);
});

router.post('/', async (req, res, next) => {
    const { credential, password } = req.body;

    const where = credential.includes('@') ? { email : credential } : { username : credential };

    const _user = await User.unscoped().findOne({
        where,
        attributes: ['id', 'username', 'email', 'hashedPassword']
    });

    if(!_user || !bcrypt.compareSync(password, _user.hashedPassword.toString())) {
        const err = new Error('Login failed');
        err.title = 'Login failed';
        err.errors = { credentials: 'The provided credentials were invalid.' };
        err.status = 401;
        return next(err);
    }

    const user = {
        id: _user.id,
        username: _user.username,
        email: _user.email
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