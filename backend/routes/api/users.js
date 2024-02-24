const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateSignup = [
    check('email').exists({ checkFalsy: true }).isEmail()
    .withMessage('Please provide a valid email.'),
    check('username').exists({ checkFalsy: true }).isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
    check('username').not().isEmail()
    .withMessage('Username cannot be an email'),
    check('password').exists().isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more'),
    handleValidationErrors
];

router.post('/', validateSignup, async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hashSync(password);

    const unsafe = await User.create({
        username, email, hashedPassword, firstName, lastName
    });

    const user = {
        id: unsafe.id,
        firstName: unsafe.firstName,
        lastName: unsafe.lastName,
        email: unsafe.email,
        username: unsafe.username
    }

    await setTokenCookie(res, user);

    res.json(user);
});

module.exports = router;