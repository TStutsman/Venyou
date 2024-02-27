const express = require('express');

const { fn, col } = require('sequelize');
const { requireAuth } =  require('../../utils/auth');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation');
const { Group, User, Membership, GroupImage } = require('../../db/models');

const router = express.Router();

// Get All Groups
router.get('/', async (req, res) => {
    const allGroups = await Group.findAll({
        include: [
            {
                model: User,
                attributes: [],
                through: {
                    model: Membership,
                    attributes: []
                },
            },
            {
                model: GroupImage,
                attributes: ['url'],
                required: false,
                where: {
                    preview: true
                }
            }
        ],
        attributes: {
            include: [[fn('COUNT', col('Users.id')), 'numMembers']]
        },
        group: 'Group.id'
    });

    // this is to get the preview url to show up without nesting
    // and without lazy loading
    allGroups.forEach(group => {
        if(group.dataValues.GroupImages.length) {
            group.dataValues.previewImage = group.dataValues.GroupImages[0].url;
        }
        delete group.dataValues.GroupImages;
    });

    res.json(allGroups);
});

// Get All Groups for Current User
router.get('/current', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const userGroups = await Group.findAll({
        include: [
            {
                model: User,
                where: {
                    id
                },
                attributes: [],
                through: {
                    model: Membership,
                    attributes: []
                },
            },
            {
                model: GroupImage,
                attributes: ['url'],
                required: false,
                where: {
                    preview: true
                }
            }
        ],
        attributes: {
            include: [[fn('COUNT', col('Users.id')), 'numMembers']]
        },
        group: 'Group.id'
    });

    // this is to get the preview url to show up without nesting
    // and without lazy loading
    allGroups.forEach(group => {
        if(group.dataValues.GroupImages.length) {
            group.dataValues.previewImage = group.dataValues.GroupImages[0].url;
        }
        delete group.dataValues.GroupImages;
    });

    res.json(userGroups);
});

const validateNewGroup = [
    check('name').exists({ checkFalsy: true }).isLength({ max: 60 })
    .withMessage('Name must be 60 characters or less'),
    check('about').exists({ checkFalsy: true }).isLength({ min: 50 })
    .withMessage('About must be 50 characters or more'),
    check('type').exists({ checkFalsy: true }).isIn(['Online', 'In Person'])
    .withMessage("Type must be 'Online' or 'In Person"),
    check('private').exists({ checkFalsy: true }).isBoolean()
    .withMessage('Private must be a boolean'),
    check('city').exists({ checkFalsy: true })
    .withMessage('City is required'),
    check('state').exists({ checkFalsy: true })
    .withMessage('State is required'),
    handleValidationErrors
];

router.post('/', requireAuth, validateNewGroup, async (req, res, next) => {
    const { name, about, type, private, city, state } = req.body;
    const { id: organizerId } = req.user;

    const newGroup = await Group.create({
        organizerId, name, about, type, private, city, state
    });

    res.statusCode = 201;
    res.json(newGroup);
});

module.exports = router;