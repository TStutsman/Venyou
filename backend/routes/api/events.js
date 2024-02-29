const express = require('express');

const { fn, col } = require('sequelize');
const { Event, Group, Venue, Attendance, EventImage } = require('../../db/models');

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
            exclude: ['createdAt', 'updatedAt'],
            include: [
                [fn('COUNT', col('Attendances.id')), 'numAttending'],
                [col('EventImages.url'), 'previewImage']
            ]
        },
        group: ['Group.id', 'Event.id', 'EventImages.url', 'Venue.id']
    });

    res.json(allEvents);
});

module.exports = router;