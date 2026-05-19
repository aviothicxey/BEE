const Joi = require('joi');

const createOrderSchema = Joi.object({
    paymentMethod: Joi.string().valid('COD', 'ONLINE').default('COD'),
    pickupTime: Joi.date().iso().optional()
});

const updateOrderStatusSchema = Joi.object({
    orderId: Joi.string().hex().length(24).required(),
    orderStatus: Joi.string()
        .valid('Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled')
        .required()
});

const ordersQuerySchema = Joi.object({
    outletId: Joi.string().hex().length(24).optional()
});

module.exports = { createOrderSchema, updateOrderStatusSchema, ordersQuerySchema };
