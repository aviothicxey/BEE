const express = require('express');
const { createOutlet, getOutlets, getOutletById, getPopularOutlets } = require('../controllers/outlet.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateBody, validateParams } = require('../middlewares/validate.middleware');
const { createOutletSchema, outletParamsSchema } = require('../validators/outlet.validator');

const outletRouter = express.Router();

// Protected routes - all require JWT authentication
outletRouter.post('/create', authenticateToken, requireRole(['admin', 'superadmin']), validateBody(createOutletSchema), createOutlet);
outletRouter.get('/popular', authenticateToken, getPopularOutlets);
outletRouter.get('/all', authenticateToken, getOutlets);
outletRouter.get('/:id', authenticateToken, validateParams(outletParamsSchema), getOutletById);

module.exports = outletRouter;
