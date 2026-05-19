const Joi = require('joi');

const createOutletSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    image: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    timing: Joi.string().allow('').optional(),
    ownerId: Joi.string().hex().length(24).optional()
});

const outletParamsSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

module.exports = { createOutletSchema, outletParamsSchema };
