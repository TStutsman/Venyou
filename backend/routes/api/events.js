const express = require('express');

const { fn, col, Op } = require('sequelize');
const { Event, Group, User, Venue, Attendance, Membership, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { validateEvent, validateAttendance, validatePagination } = require('../../utils/validation');
const { getRole } = require('../../utils/perms');
const { forbidden, venueNotFound, eventNotFound, userNotFound } = require('../../utils/errors');

const router = express.Router();

router.get('/', validatePagination, async (req, res, next) => {
    const { page, size, name, type, startDate } = req.query;

    const pagination = {
        limit : size ? size : 20,
        offset : size && page ? size * (page - 1) : 0,
        subQuery: false
    }

    const where = {}
    if(name) where.name = { [Op.substring]: name };
    if(type) where.type = type;
    if(startDate) where.startDate = {
        [Op.lt]: new Date(startDate),
        [Op.gt]: new Date(new Date(startDate) - 24 * 60 * 60 * 1000)
    };

    const allEvents = await Event.findAll({
        ...pagination,
        where,
        include: [
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
            },
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ],
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'capacity', 'price', 'description'],
            include: [
                [fn('COUNT', col('Attendances.id')), 'numAttending'],
                [col('EventImages.url'), 'previewImage']
            ]
        },
        group: ['Group.id', 'Event.id', 'EventImages.url', 'Venue.id']
    });

    const resObj = {
        "Events": allEvents
    }

    res.json(resObj);
});

router.post('/:eventId/images', requireAuth,  async (req, res, next) => {
    const { url, preview } = req.body;
    const { id } = req.user;

    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Attendance,
                attributes: ['userId', 'status']
            },
            {
                model: Group,
                attributes: ['organizerId'],
                include: {
                    model: Membership,
                    attributes: ['userId', 'status']
                }
            }
        ]
    });

    if(!event) return next(eventNotFound);

    const eventObj = event.toJSON();

    const isCohost = eventObj.Group.Memberships.some(member => member.userId === id && member.status === 'co-host');

    const isAttendee = eventObj.Attendances.some(invitee => invitee.userId === id && invitee.status === 'attending');

    const isOrganizer = eventObj.Group.organizerId === id;

    if(!(isOrganizer || isCohost || isAttendee)) {
        return next(forbidden);
    }

    const newImage = await event.createEventImage({
        url, preview
    });

    const resObj = newImage.toJSON();

    delete resObj.createdAt;
    delete resObj.updatedAt;
    delete resObj.eventId;

    res.json(resObj);
});

router.get('/:eventId', async (req, res, next) => {
    
    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'address', 'city', 'state', 'lat', 'lng']
            },
            {
                model: Attendance,
                attributes: []
            },
            {
                model: EventImage,
                attributes: ['id', 'url', 'preview'],
            }
        ],
        attributes: {
            include: [
                [fn('COUNT', col('Attendances.id')), 'numAttending']
            ],
            exclude: ['createdAt', 'updatedAt']
        },
        group: ['Event.id', 'Group.id', 'Venue.id', 'EventImages.id']
    });

    if(!event) return next(eventNotFound);

    res.json(event);
});

router.put('/:eventId', requireAuth, validateEvent, async (req, res, next) => {
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const { id } = req.user;

    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: {
                    model: Membership,
                    attributes: ['userId', 'status']
                }
            }
        ]
    });

    if(!event) return next(eventNotFound);

    const venue = await Venue.findByPk(venueId);

    if(!venue) return next(venueNotFound);

    const role = getRole(event, id);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);

    event.set({
        venueId, name, type, capacity, price, description, startDate, endDate
    });

    const updated = await event.save();

    const eventJson = updated.toJSON();

    delete eventJson.createdAt;
    delete eventJson.updatedAt;
    delete eventJson.Group;

    res.json(eventJson)
});

router.delete('/:eventId', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: {
                    model: Membership,
                    attributes: ['userId', 'status']
                }
            }
        ]
    });

    if(!event) return next(eventNotFound);

    const role = getRole(event, id);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);
    
    await event.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

router.get('/:eventId/attendees', async (req, res, next) => {
    const { id } = req.user;

    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: {
                    model: Membership,
                    attributes: ['userId', 'status']
                }
            },
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName'],
                through: {
                    model: Attendance,
                    attributes: ['status']
                }
            }
        ]
    });

    if(!event) return next(eventNotFound);

    const eventJson = event.toJSON();

    const role = getRole(event, id);

    if(role !== 'organizer' && role !== 'co-host') {
        eventJson.Users = eventJson.Users.filter(user => user.Attendance.status !== 'pending');
    }

    res.json({
        Attendees: eventJson.Users
    });
});

router.post('/:eventId/attendance', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: {
                    model: Membership,
                    attributes: ['userId', 'status']
                }
            },
            {
                model: Attendance,
                attributes: ['userId', 'status'],
                required: false,
                where: {
                    userId: id
                }
            }
        ]
    });

    if(!event) return next(eventNotFound);

    const role = getRole(event, id);

    if(role === 'stranger' || role === 'pending') return next(forbidden);

    const eventJson = event.toJSON();

    if(eventJson.Attendances.length){
        if(eventJson.Attendances[0].status === 'pending'){
            const err = new Error("Attendance has already been requested");
            err.title = "Attendance has already been requested";
            err.status = 400;
            return next(err);
        } else {
            const err = new Error("User is already an attendee of the event");
            err.title = "User is already an attendee of the event";
            err.status = 400;
            return next(err);
        }
    }

    const newAttendance = await event.createAttendance({
        userId: id, status: 'pending'
    });

    const resJson = newAttendance.toJSON();

    res.json({
        userId: resJson.userId,
        status: resJson.status
    })
});

router.put('/:eventId/attendance', requireAuth, validateAttendance, async (req, res, next) => {
    const { userId, status } = req.body;
    const { id } = req.user;

    const user = await User.findByPk(userId);

    if(!user) return next(userNotFound);

    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: {
                    model: Membership,
                    attributes: ['userId', 'status']
                }
            }
        ]
    });

    if(!event) return next(eventNotFound);

    const attendance = await Attendance.findOne({
        where: {
            userId: user.id,
            eventId: event.id
        }
    });

    if(!attendance) {
        const err = new Error("Attendance between the user and the event does not exist");
        err.title = "Attendance between the user and the event does not exist";
        err.status = 404;
        return next(err);
    }

    const role = getRole(event, id);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);

    attendance.set({ status });

    const updated = await attendance.save();

    const resJson = updated.toJSON();

    delete resJson.createdAt;
    delete resJson.updatedAt;

    res.json(resJson);
});

router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
            }
        ]
    });

    if(!event) return next(eventNotFound);

    const user = await User.findByPk(req.params.userId);

    if(!user) return next (userNotFound);

    const attendance = Attendance.findOne({
        where: {
            eventId: event.id,
            userId: user.id
        }
    });

    if(!attendance) {
        const err = new Error("Attendance does not exist for this User");
        err.title = "Attendance does not exist for this User";
        err.status = 404;
        return next(err);
    }

    const role = getRole(event, id);

    if(role !== 'organizer' && user.id !== id) return next(forbidden);

    await attendance.destroy();

    res.json({
        message: "Successfully deleted attendance from event"
    })
});

module.exports = router;