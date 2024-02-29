const express = require('express');

const { literal } = require('sequelize');
const { requireAuth } =  require('../../utils/auth');
const { validateVenue } = require('../../utils/validation');
const { Venue, Group, Membership } = require('../../db/models');

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

    if(!venue) {
        const err = new Error("Venue couldn't be found");
        err.title = "Venue couldn't be found";
        err.status = 404;
        next(err);
    }

    const group = venue.Group.toJSON();
    const isCohost = group.Memberships.some(member => member.userId === id && member.status === 'co-host');

    if(id !== group.organizerId && !isCohost){
        const err = new Error('Forbidden');
        err.title = 'Forbidden';
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