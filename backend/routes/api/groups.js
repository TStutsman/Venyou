const express = require('express');

const { fn, col, Op, literal } = require('sequelize');
const { requireAuth } =  require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { Group, User, Venue, Membership, GroupImage } = require('../../db/models');

const router = express.Router();

const groupNotFound = (next) => {
    const err = new Error("Group couldn't be found");
    err.title = "Group couldn't be found";
    err.status = 404;
    return next(err);
}

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

// Input validation for Groups
const validateGroup = [
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

// Create new Group
router.post('/', requireAuth, validateGroup, async (req, res, next) => {
    const { name, about, type, private, city, state } = req.body;
    const { id: organizerId } = req.user;

    const newGroup = await Group.create({
        organizerId, name, about, type, private, city, state
    });

    res.statusCode = 201;
    res.json(newGroup);
});

// Add new Group Image
// Auth: user must be organizer
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

// Edit a Group
// Auth: user must be organizer
router.put('/:groupId', requireAuth, validateGroup, async (req, res, next) => {
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

// Delete a Group
// Auth: user must be organizer
router.delete('/:groupId', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId);

    if(!group) {
        
    }

    if(id !== group.organizerId){
        const err = new Error('Must be organizer to delete a group');
        err.title = 'Must be organizer to delete a group';
        err.status = 403;
        return next(err);
    }

    await group.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

// Get all Venues for a group
// Auth: user must be organizer or co-host
router.get('/:groupId/venues', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId, {
        include: [
            {
                model: Membership,
                attributes: ['userId', 'status']
            },
            {
                model: Venue,
            }
        ]
    });

    if(!group) return groupNotFound(next);

    const isCohost = group.Memberships.filter(member => member.userId === id && member.status === 'co-host');

    if(id !== group.organizerId && !isCohost){
        const err = new Error('Must be organizer or cohost to view a groups venues');
        err.title = 'Must be organizer or cohost to view a groups venues';
        err.status = 403;
        return next(err);
    }

    const venues = group.Venues;

    res.json(venues);
});

// Input validation for Venues
const validateVenue = [
    check('address').exists({ checkFalsy: true })
    .withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true })
    .withMessage('City is required'),
    check('state').exists({ checkFalsy: true })
    .withMessage('State is required'),
    check('lat').exists({ checkFalsy: true }).isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be within -90 and 90'),
    check('lng').exists({ checkFalsy: true }).isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be within -180 and 180'),
    handleValidationErrors
];

// Create a new Venue for a Group
// Auth: user must be organizer or co-host
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res, next) => {
    const { address, city, state, lat, lng } = req.body;
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId, {
        include: {
            model: Membership,
            attributes: ['userId', 'status']
        },
    });

    if(!group) return groupNotFound(next);

    const isCohost = group.Memberships.filter(member => member.userId === id && member.status === 'co-host');

    if(id !== group.organizerId && !isCohost){
        const err = new Error('Must be organizer or cohost to create a group venue');
        err.title = 'Must be organizer or cohost to create a group venue';
        err.status = 403;
        return next(err);
    }

    const newVenue = await group.createVenue({
        groupId: group.id, address, city, state, lat, lng
    });

    delete newVenue.dataValues.createdAt;
    delete newVenue.dataValues.updatedAt;

    res.json(newVenue);
});

module.exports = router;