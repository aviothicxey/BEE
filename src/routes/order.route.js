const express = require('express');
const authenticateToken = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateBody, validateQuery } = require('../middlewares/validate.middleware');
const { createOrderSchema, updateOrderStatusSchema, ordersQuerySchema } = require('../validators/order.validator');
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/order.controller');

/*
  MVC note: Routes only map URLs to controller logic.
  Postman tips:
  - POST /api/order/create with Authorization: Bearer <token>
    Sample request body:
    {
      "paymentMethod": "COD",
      "pickupTime": "2026-05-10T10:30:00.000Z"
    }
    Sample success response:
    {
      "success": true,
      "message": "Order created successfully.",
      "data": {
        "orderNumber": "ORD-1715280000000-1234",
        "paymentMethod": "COD",
        "paymentStatus": "Pending",
        "totalPrice": 120,
        "items": [
          { "menuItemId": "...", "name": "Veg Roll", "price": 40, "quantity": 3 }
        ]
      }
    }
  - GET  /api/order/myorders with Authorization header
  - GET  /api/order/?outletId=<id> (admin only)
  - PUT  /api/order/status with JSON { orderId, orderStatus }
*/

const orderRouter = express.Router();

orderRouter.post('/create', authenticateToken, requireRole(['student']), validateBody(createOrderSchema), createOrder);
orderRouter.get('/myorders', authenticateToken, requireRole(['student']), getMyOrders);
orderRouter.get('/', authenticateToken, requireRole(['admin', 'superadmin']), validateQuery(ordersQuerySchema), getAllOrders);
orderRouter.put('/status', authenticateToken, requireRole(['admin', 'superadmin']), validateBody(updateOrderStatusSchema), updateOrderStatus);

module.exports = orderRouter;
