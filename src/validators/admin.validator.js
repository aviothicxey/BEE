const Joi = require('joi');

const updateUserRoleSchema = Joi.object({
    role: Joi.string().valid('student', 'admin', 'superadmin').required()
});

const toggleUserBlockSchema = Joi.object({
    isBlocked: Joi.boolean().required()
});

const userParamsSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const outletParamsSchema = Joi.object({
    id: Joi.string().hex().length(24).required()
});

const toggleOutletSuspensionSchema = Joi.object({
    isSuspended: Joi.boolean().required()
});

module.exports = {
    updateUserRoleSchema,
    toggleUserBlockSchema,
    toggleOutletSuspensionSchema,
    userParamsSchema,
    outletParamsSchema
};
