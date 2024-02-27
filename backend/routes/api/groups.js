const express = require('express');

const { requireAuth } =  require('../../utils/auth');
const { Group } = require('../../db/models');

const router = express.Router();


// Require Auth?: false
router.get('/', async (req, res) => {
    const allGroups = await Group.findAll();

    res.json(allGroups);
});