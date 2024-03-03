const { validationResult, check, query } =  require('express-validator');

const handleValidationErrors = (req, _res, next) => {
    const validationErrors = validationResult(req);

    if(!validationErrors.isEmpty()) {
        const errors = {};
        validationErrors.array().forEach(error => errors[error.path] = error.msg);

        const err = new Error('Bad request');
        err.errors = errors;
        err.status = 400;
        err.title = 'Bad request';
        next(err);
    }

    next();
}
const capitalizeWords = (string) => {
    let caps =  string.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
    console.log('CAPS: ',caps);
    return caps;
}

// Input validation for Groups
const validateGroup = [
    check('name').exists({ checkFalsy: true }).isLength({ max: 60 })
    .withMessage('Name must be 60 characters or less'),
    check('about').exists({ checkFalsy: true }).isLength({ min: 50 })
    .withMessage('About must be 50 characters or more'),
    check('type').exists({ checkFalsy: true })
    .customSanitizer(string => capitalizeWords(string)).isIn(['Online', 'In Person'])
    .withMessage("Type must be 'Online' or 'In Person"),
    check('private').exists().isBoolean()
    .withMessage('Private must be a boolean'),
    check('city').exists({ checkFalsy: true })
    .withMessage('City is required'),
    check('state').exists({ checkFalsy: true })
    .withMessage('State is required'),
    handleValidationErrors
];

// Input validation for Venues
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


const validateEvent = [
    check('name').exists({ checkFalsy: true }).isLength({ min: 5 })
    .withMessage('Name must be at least 5 characters'),
    check('type').exists({ checkFalsy: true }).isString()
    .customSanitizer(string => capitalizeWords(string))
    .isIn(['Online', 'In Person'])
    .withMessage('Type must be Online or In Person'),
    check('capacity').exists({ checkFalsy: true }).isInt()
    .withMessage('Capacity must be an integer'),
    check('price').exists({ checkFalsy: true }).isFloat({ min: 0 })
    .withMessage('Price is invalid'),
    check('description').exists({ checkFalsy: true })
    .withMessage('Description is required'),
    check('startDate').exists({ checkFalsy: true }).isAfter({ comparisonDate: new Date(Date.now()).toDateString() })
    .withMessage('Start date must be in the future'),
    check('endDate').exists({ checkFalsy: true }).custom((date, { req }) => date > req.body.startDate)
    .withMessage('End date is less than start date'),
    handleValidationErrors
];

const validateMembership = [
    check('status').exists({ checkFalsy: true }).isString().not().isIn(['pending'])
    .withMessage('Cannot change a membership status to pending'),
    handleValidationErrors
];

const validateAttendance = [
    check('status').exists({ checkFalsy: true }).isString().not().isIn(['pending'])
    .withMessage('Cannot change an attendance status to pending'),
    handleValidationErrors
];

const validatePagination = [
    query('page').optional().isInt({ min: 1, max: 10 })
    .withMessage("Page must be greater than or equal to 1"),
    query('size').optional().isInt({ min: 1, max: 20 })
    .withMessage("Size must be greater than or equal to 1"),
    query('name').optional().not().isNumeric()
    .withMessage("Name must be a string"),
    query('type').optional().isString().customSanitizer(string => capitalizeWords(string))
    .isIn(['Online', 'In Person'])
    .withMessage("Type must be 'Online' or 'In Person'"),
    query('startDate').optional().custom(dateString => Date.parse(dateString) > Date.parse('1970-01-01'))
    .withMessage("Start date must be a valid datetime"),
    handleValidationErrors
]

module.exports = { handleValidationErrors, validateGroup, validateVenue, validateEvent, validateMembership, validateAttendance, validatePagination };