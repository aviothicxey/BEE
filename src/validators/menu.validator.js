const Joi = require('joi');

const createMenuSchema = Joi.object({
    outletId: Joi.string().hex().length(24).required(),
    name: Joi.string().min(2).max(200).required(),
    price: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
    image: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional()
});

const updateMenuSchema = Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    price: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    image: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    available: Joi.boolean().optional()
});

const menuParamsSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const menuOutletParamsSchema = Joi.object({
    outletId: Joi.string().hex().length(24).required()
});

const menuSearchSchema = Joi.object({
    q: Joi.string().min(2).max(100).required()
});

module.exports = { createMenuSchema, updateMenuSchema, menuParamsSchema, menuOutletParamsSchema, menuSearchSchema };
