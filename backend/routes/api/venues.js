const express = require('express');

const { literal } = require('sequelize');
const { requireAuth } =  require('../../utils/auth');
const { validateVenue } = require('../../utils/validation');
const { Venue, Group, Membership } = require('../../db/models');
const { forbidden, venueNotFound } = require('../../utils/errors');
const { getRole } = require('../../utils/perms');

const router = express.Router();

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

    if(!venue) return next(venueNotFound);

    const role = getRole(venue, id);

    console.log('ROLE:', role);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);

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