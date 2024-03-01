const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const groupsRouter = require('./groups.js');
const venuesRouter = require('./venues.js');
const eventsRouter = require('./events.js');
const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { GroupImage, EventImage, Group, Event, Membership } = require('../../db/models');
const { getRole } = require('../../utils/perms.js');
const { forbidden } = require('../../utils/errors.js');

router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/groups', groupsRouter);
router.use('/venues', venuesRouter);
router.use('/events', eventsRouter);

router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
});

// Error: Authorize co-hosts
router.delete('/group-images/:imageId', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const groupImage = await GroupImage.findByPk(req.params.imageId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: {
                    model: Membership,
                    attributes: ['userId', 'status'],
                }
            }
        ]
    });

    if(!groupImage) {
        const err = new Error("Group Image couldn't be found");
        err.title = "Group Image couldn't be found";
        err.status = 404;
        return next(err);
    }

    const role = getRole(groupImage, id);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);

    await groupImage.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

// Error: Authorize co-hosts
router.delete('/event-images/:imageId', requireAuth, async (req, res, next) => {
    const { id } = req.user;

    const eventImage = await EventImage.findByPk(req.params.imageId, {
        include: [
            {
                model: Event,
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
            }
        ]
    });

    // console.log('EVENT IMAGE: ',eventImage.toJSON());

    if(!eventImage) {
        const err = new Error("Event Image couldn't be found");
        err.title = "Event Image couldn't be found";
        err.status = 404;
        return next(err);
    }

    const role = getRole(eventImage, id);

    console.log('Role:', role);

    if(role !== 'organizer' && role !== 'co-host') return next(forbidden);

    await eventImage.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

module.exports = router;