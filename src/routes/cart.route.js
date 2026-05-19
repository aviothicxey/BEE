const express = require('express');
const {
	addToCart,
	getCart,
	updateCartItem,
	removeCartItem,
	clearCart
} = require('../controllers/cart.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateBody } = require('../middlewares/validate.middleware');
const {
	addToCartSchema,
	updateCartItemSchema,
	removeCartItemSchema
} = require('../validators/cart.validator');

const cartRouter = express.Router();

cartRouter.post('/add', authenticateToken, requireRole(['student']), validateBody(addToCartSchema), addToCart);
cartRouter.get('/', authenticateToken, requireRole(['student']), getCart);
cartRouter.put('/update', authenticateToken, requireRole(['student']), validateBody(updateCartItemSchema), updateCartItem);
cartRouter.delete('/remove', authenticateToken, requireRole(['student']), validateBody(removeCartItemSchema), removeCartItem);
cartRouter.delete('/clear', authenticateToken, requireRole(['student']), clearCart);

module.exports = cartRouter;