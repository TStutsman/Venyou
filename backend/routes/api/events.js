const express = require('express');

const { fn, col } = require('sequelize');
const { Event, Group, Venue, Attendance, Membership, EventImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { validateEvent } = require('../../utils/validation');
const { organizerOrCohost } = require('../../utils/perms');
const { forbidden, venueNotFound, eventNotFound } = require('../../utils/errors');

const router = express.Router();

router.get('/', async (req, res, next) => {
    const allEvents = await Event.findAll({
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
            exclude: ['createdAt', 'updatedAt', 'capacity', 'price'],
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
        }
    });

    if(!event.toJSON().id) return next(eventNotFound);

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

    if(!organizerOrCohost(event, id)) return next(forbidden);

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

    if(!organizerOrCohost(event, id)) return next(forbidden);

    await event.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

module.exports = router;