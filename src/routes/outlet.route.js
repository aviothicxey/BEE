const express = require('express');
const { createOutlet, getOutlets, getOutletById, getPopularOutlets } = require('../controllers/outlet.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateBody, validateParams } = require('../middlewares/validate.middleware');
const { createOutletSchema, outletParamsSchema } = require('../validators/outlet.validator');

const outletRouter = express.Router();

// PUBLIC routes - no auth needed
outletRouter.get('/popular', getPopularOutlets);
outletRouter.get('/all', getOutlets);
outletRouter.get('/:id', validateParams(outletParamsSchema), getOutletById);

// Protected routes
outletRouter.post('/create', authenticateToken, requireRole(['admin', 'superadmin']), validateBody(createOutletSchema), createOutlet);

module.exports = outletRouter;