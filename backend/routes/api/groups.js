const express = require('express');

const { fn, col, Op, literal } = require('sequelize');
const { requireAuth } =  require('../../utils/auth');
const { validateGroup, validateVenue, validateEvent } = require('../../utils/validation');
const { Group, User, Venue, Event, Membership, GroupImage, Attendance, EventImage } = require('../../db/models');

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
                attributes: [],
                required: false,
                where: {
                    preview: true
                }
            }
        ],
        attributes: {
            include: [
                [fn('COUNT', col('Users.id')), 'numMembers'],
                ['$GroupImages.url$', 'previewImage']
            ]
        },
        group: 'Group.id'
    });

    res.json(allGroups);
});

// Get All Groups for current User
router.get('/current', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const userGroups = await Group.findAll({
        where: {
            [Op.or]: [{'$Memberships.userId$': id}, {organizerId: id}]
        },
        include: [
            {
                model: Membership,
                attributes: []
            },
            {
                model: GroupImage,
                attributes: [],
                required: false,
                where: {
                    preview: true
                }
            }
        ],
        attributes: {
            include: [
                [fn('COUNT', col('Memberships.userId')), 'numMembers'],
                [col('GroupImages.url'), 'previewImage']
            ]
        },
        group: 'Group.id'
    });

    res.json(userGroups);
});

// Get Details of Group from an id
router.get('/:groupId', async (req, res, next) => {
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

router.get('/:groupId/events', async (req, res, next) => {

    const group = await Group.findByPk(req.params.groupId, {
        include: {
            model: Event,
            include: [
                {
                    model: Group,
                    attributes: ['id', 'name', 'city', 'state']
                },
                {
                    model: Venue,
                    attributes: ['id', 'city', 'state']
                },
                {
                    model: Attendance,
                    attributes: []
                },
                {
                    model: EventImage,
                    attributes: [[col('url'), 'previewImage']],
                    required: false,
                    where: {
                        preview: true
                    }
                }
            ],
            attributes: {
                include: [
                    [fn('COUNT', col('Events.Attendances.id')), 'numAttending'],
                    // [col('EventImages.url'), 'previewImage']
                ]
            }
        },
        attributes: []
    });

    if(!group) return groupNotFound(next);

    res.json(group);
});

// router.post('/:groupId/events', requireAuth, validateEvent, async (req, res, next) => {

// });

module.exports = router;