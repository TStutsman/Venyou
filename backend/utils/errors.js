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

module.exports = { formatErrors };