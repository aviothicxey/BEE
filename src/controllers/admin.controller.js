const Menu = require('../models/menu.model');
const Order = require('../models/order.model');
const Outlet = require('../models/outlet.model');
const User = require('../models/user.model');
const { sendError, sendSuccess } = require('../utils/response');

function getUserId(req) {
    return req.user?.id || req.user?._id || req.user?.userId;
}

async function canManageOutlet(userId, outletId) {
    const user = await User.findById(userId);
    if (user && (user.role === 'admin' || user.role === 'superadmin')) return true;
    const outlet = await Outlet.findById(outletId);
    return outlet?.ownerId?.toString() === userId.toString();
}

const ORDER_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

async function addMenuItem(req, res) {
    const userId = getUserId(req);
    const { outletId, name, price, image, description, available } = req.body;
    if (!outletId || !name || price === undefined) return sendError(res, 400, 'Outlet ID, name and price are required.');
    try {
        const outlet = await Outlet.findById(outletId);
        if (!outlet) return sendError(res, 404, 'Outlet not found.');
        const allowed = await canManageOutlet(userId, outletId);
        if (!allowed) return sendError(res, 403, 'You cannot manage this outlet.');
        const menuItem = await Menu.create({ outletId, name, price: parseFloat(price), image: image || '', description: description || '', available: available !== undefined ? available : true });
        return sendSuccess(res, 201, 'Menu item created.', menuItem);
    } catch (err) {
        console.error('Admin add menu error:', err);
        return sendError(res, 500, 'Failed to create menu item.');
    }
}

async function updateMenuItem(req, res) {
    const userId = getUserId(req);
    const { id } = req.params;
    const { name, price, image, description, available } = req.body;
    try {
        const menuItem = await Menu.findById(id);
        if (!menuItem) return sendError(res, 404, 'Menu item not found.');
        const allowed = await canManageOutlet(userId, menuItem.outletId);
        if (!allowed) return sendError(res, 403, 'You cannot manage this outlet.');
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (image !== undefined) updateData.image = image;
        if (description !== undefined) updateData.description = description;
        if (available !== undefined) updateData.available = available;
        const updated = await Menu.findByIdAndUpdate(id, updateData, { new: true });
        return sendSuccess(res, 200, 'Menu item updated.', updated);
    } catch (err) {
        console.error('Admin update menu error:', err);
        return sendError(res, 500, 'Failed to update menu item.');
    }
}

async function deleteMenuItem(req, res) {
    const userId = getUserId(req);
    const { id } = req.params;
    try {
        const menuItem = await Menu.findById(id);
        if (!menuItem) return sendError(res, 404, 'Menu item not found.');
        const allowed = await canManageOutlet(userId, menuItem.outletId);
        if (!allowed) return sendError(res, 403, 'You cannot manage this outlet.');
        await Menu.findByIdAndDelete(id);
        return sendSuccess(res, 200, 'Menu item deleted.');
    } catch (err) {
        console.error('Admin delete menu error:', err);
        return sendError(res, 500, 'Failed to delete menu item.');
    }
}

async function viewOutletOrders(req, res) {
    const userId = getUserId(req);
    const { outletId } = req.params;
    try {
        const allowed = await canManageOutlet(userId, outletId);
        if (!allowed) return sendError(res, 403, 'You cannot view orders for this outlet.');
        const orders = await Order.find({ outletId }).sort({ createdAt: -1 });
        return sendSuccess(res, 200, 'Outlet orders fetched.', orders);
    } catch (err) {
        console.error('Admin view outlet orders error:', err);
        return sendError(res, 500, 'Failed to fetch outlet orders.');
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
        const allowed = await canManageOutlet(userId, order.outletId);
        if (!allowed) return sendError(res, 403, 'You cannot update this order.');
        order.orderStatus = orderStatus;
        await order.save();
        return sendSuccess(res, 200, 'Order status updated.', order);
    } catch (err) {
        console.error('Admin update order status error:', err);
        return sendError(res, 500, 'Failed to update order status.');
    }
}

async function getOrdersCount(req, res) {
    try {
        const count = await Order.countDocuments();
        return sendSuccess(res, 200, 'Orders count fetched.', { count });
    } catch (err) {
        console.error('Admin orders count error:', err);
        return sendError(res, 500, 'Failed to fetch orders count.');
    }
}

async function getRevenueSummary(req, res) {
    try {
        const summary = await Order.aggregate([
            { $match: { orderStatus: { $in: ['Completed', 'Ready', 'Preparing', 'Accepted'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } }
        ]);
        const stats = summary[0] || { total: 0, count: 0 };
        return sendSuccess(res, 200, 'Revenue summary fetched.', stats);
    } catch (err) {
        console.error('Admin revenue summary error:', err);
        return sendError(res, 500, 'Failed to fetch revenue summary.');
    }
}

// NEW: Get all users (superadmin only)
async function getAllUsers(req, res) {
    try {
        const users = await User.find()
            .select('name email phone role pfp isBlocked isGoogleAuth createdAt')
            .sort({ createdAt: -1 });
        return sendSuccess(res, 200, 'Users fetched.', users);
    } catch (err) {
        console.error('Get all users error:', err);
        return sendError(res, 500, 'Failed to fetch users.');
    }
}

async function updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) return sendError(res, 404, 'User not found.');
        user.role = role;
        await user.save();
        return sendSuccess(res, 200, 'User role updated.', { id: user._id, role: user.role });
    } catch (err) {
        console.error('Admin update user role error:', err);
        return sendError(res, 500, 'Failed to update user role.');
    }
}

async function toggleUserBlock(req, res) {
    const { id } = req.params;
    const { isBlocked } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) return sendError(res, 404, 'User not found.');
        user.isBlocked = isBlocked;
        await user.save();
        return sendSuccess(res, 200, 'User block status updated.', { id: user._id, isBlocked: user.isBlocked });
    } catch (err) {
        console.error('Admin toggle user block error:', err);
        return sendError(res, 500, 'Failed to update user block status.');
    }
}

async function toggleOutletSuspension(req, res) {
    const { id } = req.params;
    const { isSuspended } = req.body;
    try {
        const outlet = await Outlet.findById(id);
        if (!outlet) return sendError(res, 404, 'Outlet not found.');
        outlet.isSuspended = isSuspended;
        await outlet.save();
        return sendSuccess(res, 200, 'Outlet suspension updated.', { id: outlet._id, isSuspended: outlet.isSuspended });
    } catch (err) {
        console.error('Admin toggle outlet suspension error:', err);
        return sendError(res, 500, 'Failed to update outlet status.');
    }
}

module.exports = {
    addMenuItem, updateMenuItem, deleteMenuItem,
    viewOutletOrders, updateOrderStatus,
    getOrdersCount, getRevenueSummary,
    getAllUsers, updateUserRole, toggleUserBlock, toggleOutletSuspension
};
