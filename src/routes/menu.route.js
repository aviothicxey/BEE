const express = require('express');
const { createMenuItem, getMenuItemsByOutlet, updateMenuItem, deleteMenuItem, searchMenuItems } = require('../controllers/menu.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateBody, validateParams, validateQuery } = require('../middlewares/validate.middleware');
const { createMenuSchema, updateMenuSchema, menuParamsSchema, menuOutletParamsSchema, menuSearchSchema } = require('../validators/menu.validator');

const menuRouter = express.Router();

// Protected routes - require JWT authentication
menuRouter.post('/create', authenticateToken, requireRole(['admin', 'superadmin']), validateBody(createMenuSchema), createMenuItem);
menuRouter.get('/search', authenticateToken, validateQuery(menuSearchSchema), searchMenuItems);
menuRouter.get('/outlet/:outletId', authenticateToken, validateParams(menuOutletParamsSchema), getMenuItemsByOutlet);
menuRouter.put('/update/:id', authenticateToken, requireRole(['admin', 'superadmin']), validateParams(menuParamsSchema), validateBody(updateMenuSchema), updateMenuItem);
menuRouter.delete('/delete/:id', authenticateToken, requireRole(['admin', 'superadmin']), validateParams(menuParamsSchema), deleteMenuItem);

module.exports = menuRouter;