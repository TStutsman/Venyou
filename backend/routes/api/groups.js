const express = require('express');

const { fn, col, Op, literal } = require('sequelize');
const { requireAuth } =  require('../../utils/auth');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation');
const { Group, User, Venue, Membership, GroupImage } = require('../../db/models');

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

// Get Details of Group from an id
router.get('/:groupId', async (req, res, next) => {
    // .scope('numMembers')
    const group = await Group.findByPk(req.params.groupId, {
        attributes: {
          include: [[fn('COUNT', col('Memberships.userId')), 'numMembers']]
        },
        include: [
            {
                model: GroupImage,
                attributes: ['id', 'url', 'preview'],
            },
            {
                model: User,
                as: 'Organizer',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Venue,
                attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
            },
            {
                model: Membership,
                attributes: [],
            },
        ]
    });

    if(!group.id) {
        const err = new Error("Group couldn't be found");
        err.title = "Group couldn't be found";
        err.status = 404;
        return next(err);
    }

    res.json(group);
});

// Get All Groups for Current User
router.get('/current', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const userGroups = await Group.findAll({
        where: {
            [Op.or]: [{'$Users.id$': id}, {organizerId: id}]
        },
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
    userGroups.forEach(group => {
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
    check('private').exists().isBoolean()
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

router.post('/:groupId/images', requireAuth, async (req, res, next) => {
    const { url, preview } = req.body;
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId);

    if(!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Group couldn't be found";
        err.status = 404;
        return next(err);
    }

    if(id !== group.organizerId){
        const err = new Error('Must be organizer to add image');
        err.title = 'Must be organizer to add image';
        err.status = 403;
        return next(err);
    }

    const newImage = await GroupImage.create({
        url, preview, groupId: group.id
    });

    const response = {
        id: newImage.id,
        url: newImage.url,
        preview: newImage.preview
    }

    res.json(response);
});

router.put('/:groupId', requireAuth, validateNewGroup, async (req, res, next) => {
    const { name, about, type, private, city, state } = req.body;
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId);

    if(!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Group couldn't be found";
        err.status = 404;
        return next(err);
    }

    if(id !== group.organizerId){
        const err = new Error('Must be organizer to edit group');
        err.title = 'Must be organizer to edit group';
        err.status = 403;
        return next(err);
    }

    group.set({
        name, about, type, private, city, state, updatedAt: literal('CURRENT_TIMESTAMP')
    });

    const saved = await group.save();

    res.json(saved);
});

module.exports = router;