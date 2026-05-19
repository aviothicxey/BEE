const Joi = require('joi');

const addToCartSchema = Joi.object({
    menuItemId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().integer().min(1).required()
});

const updateCartItemSchema = Joi.object({
    menuItemId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().integer().min(1).required()
});

const removeCartItemSchema = Joi.object({
    menuItemId: Joi.string().hex().length(24).required()
});

module.exports = {
    addToCartSchema,
    updateCartItemSchema,
    removeCartItemSchema
};
