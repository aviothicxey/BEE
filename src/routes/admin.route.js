const express = require('express');
const authenticateToken = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateBody, validateParams } = require('../middlewares/validate.middleware');
const { updateOrderStatusSchema } = require('../validators/order.validator');
const {
    addMenuItem, updateMenuItem, deleteMenuItem,
    viewOutletOrders, updateOrderStatus,
    getOrdersCount, getRevenueSummary,
    getAllUsers, updateUserRole, toggleUserBlock, toggleOutletSuspension
} = require('../controllers/admin.controller');
const {
    updateUserRoleSchema, toggleUserBlockSchema, toggleOutletSuspensionSchema,
    userParamsSchema, outletParamsSchema
} = require('../validators/admin.validator');

const adminRouter = express.Router();

adminRouter.use(authenticateToken);
adminRouter.use(requireRole(['admin', 'superadmin']));

// Menu management (admin + superadmin)
adminRouter.post('/menu', addMenuItem);
adminRouter.put('/menu/:id', updateMenuItem);
adminRouter.delete('/menu/:id', deleteMenuItem);

// Order management (admin + superadmin)
adminRouter.get('/orders/outlet/:outletId', viewOutletOrders);
adminRouter.put('/orders/status', validateBody(updateOrderStatusSchema), updateOrderStatus);

// Stats (admin + superadmin)
adminRouter.get('/stats/orders-count', getOrdersCount);
adminRouter.get('/stats/revenue', getRevenueSummary);

// Superadmin-only routes
adminRouter.get('/users', requireRole(['superadmin']), getAllUsers);
adminRouter.put('/users/:id/role', requireRole(['superadmin']), validateParams(userParamsSchema), validateBody(updateUserRoleSchema), updateUserRole);
adminRouter.put('/users/:id/block', requireRole(['superadmin']), validateParams(userParamsSchema), validateBody(toggleUserBlockSchema), toggleUserBlock);
adminRouter.put('/outlets/:id/suspend', requireRole(['superadmin']), validateParams(outletParamsSchema), validateBody(toggleOutletSuspensionSchema), toggleOutletSuspension);

module.exports = adminRouter;
