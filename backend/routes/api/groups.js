const express = require('express');

const { fn, col, Op, literal } = require('sequelize');
const { requireAuth } =  require('../../utils/auth');
const { validateGroup, validateVenue, validateEvent, validateMembership } = require('../../utils/validation');
const { Group, User, Venue, Event, Membership, GroupImage, Attendance, EventImage } = require('../../db/models');
const { venueNotFound, groupNotFound, userNotFound, forbidden } = require('../../utils/errors');
const { getRole } = require('../../utils/perms');

const router = express.Router();

// Get All Groups
router.get('/', async (req, res) => {
    const allGroups = await Group.findAll({
        include: [
            {
                model: User,
                attributes: ['id'],
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
            },
            {
                model: Event,
                attributes: ['id']
            }
        ],
        attributes: {
            include: [
                [col('GroupImages.url'), 'previewImage']
            ]
        },
        group: ['Group.id', 'GroupImages.id', 'User.id']
    });

    // removes the 'Users' and 'Events' keys and adds num keys for each
    const groups = allGroups.map(each => {
        const group = each.toJSON();
        group.numMembers = group.Users.length;
        group.numEvents = group.Events.length;
        delete group.Users;
        delete group.Events;
        return group;
    });

    res.json(groups);
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
                attributes: ['userId']
            },
            {
                model: GroupImage,
                attributes: [],
                required: false,
                where: {
                    preview: true
                }
            },
            {
                model: Event,
                attributes: ['id']
            }
        ],
        attributes: {
            include: [
                [col('GroupImages.url'), 'previewImage']
            ]
        },
        group: ['Group.id', 'GroupImages.id', 'Memberships.id']
    });

    // removes the 'Users' and 'Events' keys and adds num keys for each
    const groups = userGroups.map(each => {
        const group = each.toJSON();
        group.numMembers = group.Memberships.length;
        group.numEvents = group.Events.length;
        delete group.Memberships;
        delete group.Events;
        return group;
    });

    res.json(groups);
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
        ],
        group: ['Group.id', 'GroupImages.id', 'Venues.id', 'Organizer.id'] // need this for render/postgres
    });

    if(!group) {
        const err = new Error("Group couldn't be found");
        err.title = "Group couldn't be found";
        err.status = 404;
        return next(err);
    }

    group.dataValues.numMembers = parseInt(group.dataValues.numMembers);

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
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
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
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
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

    if(!group) return next(groupNotFound);

    const role = getRole(group, id);

    if(role !== 'organizer') return next(forbidden);

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
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }
        ]
    });

    if(!group) return next(groupNotFound);

    const role = getRole(group, id);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);

    res.json({
        Venues: group.dataValues.Venues
    });
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

    if(!group) return next(groupNotFound);

    const role = getRole(group, id);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);

    const newVenue = await group.createVenue({
        groupId: group.id, address, city, state, lat, lng
    });

    delete newVenue.dataValues.createdAt;
    delete newVenue.dataValues.updatedAt;

    res.json(newVenue);
});

// Get all events for a Group
router.get('/:groupId/events', async (req, res, next) => {

    const group = await Group.findByPk(req.params.groupId);

    if(!group) return next(groupNotFound);

    const events = await group.getEvents({
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
                attributes: [],
                required: false,
                where: {
                    preview: true
                }
            }
        ],
        attributes: {
            include: [
                [fn('COUNT', col('Attendances.id')), 'numAttending'],
                [col('EventImages.url'), 'previewImage']
            ],
            exclude: ['price', 'capacity', 'createdAt', 'updatedAt']
        },
        group: ['Event.id', 'Group.id', 'Venue.id', 'EventImages.url']
    });

    if(events.length) events.forEach(event => event.dataValues.numAttending = parseInt(event.dataValues.numAttending));

    const resObj = {
        "Events": events
    }

    res.json(resObj);
});

// Create a new event for a group
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res, next) => {
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId, {
        include: {
            model: Membership,
            attributes: ['userId', 'status']
        }
    });

    if(!group) return next(groupNotFound);

    const venue = await Venue.findByPk(venueId);

    if(!venue) return next(venueNotFound);
    
    // const groupJson = group.toJSON();
    // const isCohost = groupJson.Memberships.some(member => member.userId === id && member.status === 'co-host');
    const role = getRole(group, id);

    console.log('-----role: ', role);
    console.log('=====organizerId: ', group.organizerId);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);
    
    const newEvent = await group.createEvent({
        venueId, name, type, capacity, price, description, startDate, endDate
    });

    const resObj = newEvent.toJSON();
    delete resObj.createdAt;
    delete resObj.updatedAt;
    
    res.json(resObj);
});

// Get all members of a group
router.get('/:groupId/members', async (req, res, next) => {
    const { id } = req.user;

    const groupMembers = await Group.findByPk(req.params.groupId, {
        include: {
            model: User,
            through: {
                model: Membership,
                attributes: ['status']
            },
            attributes: ['id','firstName','lastName']
        },
        attributes: ['organizerId']
    });

    if(!groupMembers) return next(groupNotFound);

    const json = groupMembers.toJSON();
    
    const role = getRole(groupMembers, id);
    
    if(role !== 'organizer' && role !== 'co-host') {
        json.Users = json.Users.filter(user => user.Membership.status !== 'pending');
    }

    res.json({
        Members: json.Users
    });
});

// Request to join a group
router.post('/:groupId/membership', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId, {
        include: [
            {
                model: Membership,
                attributes: ['userId', 'status']
            }
        ]
    });

    if(!group) return next(groupNotFound);

    const groupjson = group.toJSON();
    
    let user = groupjson.Memberships.find(member => member.userId === id);

    if(user && user.status === 'pending') {
        const alreadyMember = new Error("Membership has already been requested");
        alreadyMember.title = "Membership has already been requested";
        alreadyMember.status = 400;
        return next(alreadyMember);
    }

    if(user && user.status !== 'pending') {
        const alreadyMember = new Error("User is already a member of the group");
        alreadyMember.title = "User is already a member of the group";
        alreadyMember.status = 400;
        return next(alreadyMember);
    }

    const newMember = await group.createMembership({
        userId: id, status: 'pending'
    });

    const resObj = newMember.toJSON();

    res.json({
        memberId: resObj.userId,
        status: resObj.status
    });
});

// Accept a member or promote a member of the group
router.put('/:groupId/membership', requireAuth, validateMembership, async (req, res, next) => {
    const { memberId, status } = req.body;
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId, {
        include: [
            {
                model: Membership,
                attributes: ['userId', 'status']
            }
        ]
    });

    if(!group) return next(groupNotFound);

    const user = await User.findByPk(memberId);

    if(!user) return next(userNotFound);

    const membership = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: group.id
        }
    });

    if(!membership) {
        const err = new Error("Membership between the user and the group does not exist");
        err.title = "Membership between the user and the group does not exist";
        err.status = 404;
        return next(err);
    }

    const role = getRole(group, id);

    if(role !== 'organizer' && role !== 'co-host' || status === 'co-host' && role !== 'organizer') return next(forbidden);

    membership.set({ status });
    
    const saved = await membership.save();
    const savedjson = saved.toJSON();

    delete savedjson.createdAt;
    delete savedjson.updatedAt;
    savedjson.memberId = savedjson.userId;
    delete savedjson.userId;

    res.json(savedjson);
});

router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const group = await Group.findByPk(req.params.groupId);

    if(!group) return next(groupNotFound);

    const user = await User.findByPk(req.params.memberId);

    if(!user) return next(userNotFound);

    const membership = await Membership.findOne({
        where: {
            userId: user.id,
            groupId: group.id
        }
    });

    if(!membership) {
        const err = new Error("Membership between the user and the group does not exist");
        err.title = "Membership between the user and the group does not exist";
        err.status = 404;
        return next(err);
    }

    const role = getRole(group, id);

    if(role !== 'organizer' && parseInt(req.params.memberId) !== id) return next(forbidden);

    await membership.destroy();

    res.json({
        message: "Successfully deleted membership from group"
    });
});

module.exports = router;