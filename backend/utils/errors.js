const formatErrors = (err, req, res, next) => {
    if(!err.errors) return next(err);
    
    if(err.errors.username === 'username must be unique') {
        err.message = 'User already exists';
        err.errors.username = 'User with that username already exists';
    }
    if(err.errors.email=== 'email must be unique') {
        err.message = 'User already exists';
        err.errors.email = 'User with that email already exists';
    }
    next(err);
};

const forbidden = new Error('Forbidden');
forbidden.title = 'Forbidden';
forbidden.status = 403;

const eventNotFound = new Error("Event couldn't be found");
eventNotFound.title = "Event couldn't be found";
eventNotFound.status = 404;

const venueNotFound = new Error("Venue couldn't be found");
venueNotFound.title = "Venue couldn't be found";
venueNotFound.status = 404;

const groupNotFound = new Error("Group couldn't be found");
groupNotFound.title = "Group couldn't be found";
groupNotFound.status = 404;

const userNotFound = new Error("User couldn't be found");
userNotFound.title = "User couldn't be found";
userNotFound.status = 404;

module.exports = { formatErrors, forbidden, eventNotFound, venueNotFound, groupNotFound, userNotFound };