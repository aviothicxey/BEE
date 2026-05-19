const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Outlet = require('../models/outlet.model');
const User = require('../models/user.model');
const { sendError, sendSuccess } = require('../utils/response');

function getUserId(req) {
    return req.user?.id || req.user?._id || req.user?.userId;
}

function calculateTotalPrice(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

const ORDER_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const PAYMENT_METHODS = ['COD', 'ONLINE'];

async function canManageOutlet(userId, outletId) {
    const user = await User.findById(userId);
    if (user && (user.role === 'admin' || user.role === 'superadmin')) return true;
    const outlet = await Outlet.findById(outletId);
    return outlet?.ownerId?.toString() === userId.toString();
}

async function createOrder(req, res) {
    const userId = getUserId(req);
    const { paymentMethod = 'COD', pickupTime } = req.body;

    if (!userId) return sendError(res, 401, 'Unauthorized.');
    if (!PAYMENT_METHODS.includes(paymentMethod)) return sendError(res, 400, 'Invalid payment method.');

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) return sendError(res, 400, 'Cart is empty. Add items before ordering.');
        if (!cart.outletId) return sendError(res, 400, 'Cart outlet is missing. Please re-add items.');

        // FIX: Ensure all prices are valid numbers
        const orderItems = cart.items.map(item => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity
        }));

        const hasInvalidPrice = orderItems.some(item => isNaN(item.price));
        if (hasInvalidPrice) return sendError(res, 400, 'Cart contains items with invalid prices. Please clear and re-add.');

        const totalPrice = calculateTotalPrice(orderItems);

        // FIX: More unique order number to prevent collisions
        const orderNumber = `CB-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

        const order = await Order.create({
            userId,
            outletId: cart.outletId,
            items: orderItems,
            totalPrice,
            paymentMethod,
            paymentStatus: 'Pending',
            orderNumber,
            pickupTime: pickupTime ? new Date(pickupTime) : null
        });

        // Clear cart after order
        cart.items = [];
        cart.outletId = null;
        cart.totalPrice = 0;
        await cart.save();

        return sendSuccess(res, 201, 'Order placed successfully.', order);
    } catch (err) {
        console.error('Create order error:', err);
        // FIX: Handle duplicate orderNumber gracefully
        if (err.code === 11000) {
            return sendError(res, 500, 'Order number conflict. Please try again.');
        }
        return sendError(res, 500, 'Failed to create order.');
    }
}

async function getMyOrders(req, res) {
    const userId = getUserId(req);
    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        return sendSuccess(res, 200, 'Orders fetched.', orders);
    } catch (err) {
        console.error('Get my orders error:', err);
        return sendError(res, 500, 'Failed to fetch orders.');
    }
}

async function getAllOrders(req, res) {
    const { outletId } = req.query;
    try {
        const filter = outletId ? { outletId } : {};
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        return sendSuccess(res, 200, 'Orders fetched.', orders);
    } catch (err) {
        console.error('Get all orders error:', err);
        return sendError(res, 500, 'Failed to fetch orders.');
    }
}

async function updateOrderStatus(req, res) {
    const userId = getUserId(req);
    const { orderId, orderStatus } = req.body;

    if (!orderId || !orderStatus) return sendError(res, 400, 'Order ID and status are required.');
    if (!ORDER_STATUSES.includes(orderStatus)) return sendError(res, 400, 'Invalid order status.');

    try {
        const order = await Order.findById(orderId);
        if (!order) return sendError(res, 404, 'Order not found.');

        const canUpdate = await canManageOutlet(userId, order.outletId);
        if (!canUpdate) return sendError(res, 403, 'You are not allowed to update this order.');

        order.orderStatus = orderStatus;
        await order.save();
        return sendSuccess(res, 200, 'Order status updated.', order);
    } catch (err) {
        console.error('Update order status error:', err);
        return sendError(res, 500, 'Failed to update order status.');
    }
}

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
