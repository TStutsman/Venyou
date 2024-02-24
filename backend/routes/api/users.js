const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hashSync(password);

    const unsafe = await User.create({
        username, email, hashedPassword
    });

    const user = {
        id: unsafe.id,
        username: unsafe.username,
        email: unsafe.email
    }

    await setTokenCookie(res, user);

    res.json(user);
});

module.exports = router;