const Joi = require('joi');
const AppError = require('../utils/appError');

function validate(schema, property) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return next(new AppError(400, 'Validation error.', error.details));
        }

        req[property] = value;
        return next();
    };
}

const validateBody = schema => validate(schema, 'body');
const validateParams = schema => validate(schema, 'params');
const validateQuery = schema => validate(schema, 'query');

module.exports = { validateBody, validateParams, validateQuery };
