const express = require('express');

const { requireAuth } =  require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { literal } = require('sequelize');
const { Venue, Group, Membership } = require('../../db/models');

const router = express.Router();

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

// Edit a Venue by Id
// Auth: organizer or co-host
router.put('/:venueId', requireAuth, validateVenue, async (req, res, next) => {
    const { address, city, state, lat, lng } = req.body;
    const { id } = req.user;

    const venue = await Venue.findByPk(req.params.venueId, {
        include: [{
            model: Group,
            attributes: ['organizerId'],
            include: [{
                model: Membership,
                attributes: ['userId', 'status']
            }]
        }]
    });

    if(!venue) {
        const err = new Error("Venue couldn't be found");
        err.title = "Venue couldn't be found";
        err.status = 404;
        next(err);
    }

    const group = venue.Group;
    const isCohost = group.Memberships.filter(member => member.userId === id && member.status === 'co-host');

    if(id !== group.organizerId && !isCohost){
        const err = new Error('Must be organizer or cohost to create a group venue');
        err.title = 'Must be organizer or cohost to create a group venue';
        err.status = 403;
        return next(err);
    }

    venue.set({
        address, city, state, lat, lng, updatedAt: literal('CURRENT_TIMESTAMP')
    });

    const saved = await venue.save();

    // formatting
    delete saved.dataValues.createdAt;
    delete saved.dataValues.updatedAt;
    delete saved.dataValues.Group;

    res.json(saved);
});

module.exports = router;