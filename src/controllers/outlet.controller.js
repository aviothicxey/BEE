const Outlet = require('../models/outlet.model');
const Order = require('../models/order.model');

async function createOutlet(req, res) {
    const { name, image, description, timing } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    try {
        const newOutlet = await Outlet.create({ name, image: image || '', description: description || '', timing: timing || '' });
        return res.status(201).json({ success: true, message: 'Outlet created successfully', data: newOutlet });
    } catch (err) {
        console.error("Create Outlet Error:", err);
        return res.status(500).json({ success: false, message: 'Failed to create outlet' });
    }
}

async function getOutlets(req, res) {
    try {
        const outlets = await Outlet.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: outlets });
    } catch (err) {
        console.error("Get Outlets Error:", err);
        return res.status(500).json({ success: false, message: 'Failed to fetch outlets' });
    }
}

async function getOutletById(req, res) {
    const { id } = req.params;
    try {
        const outlet = await Outlet.findById(id);
        if (!outlet) return res.status(404).json({ success: false, message: 'Outlet not found' });
        return res.status(200).json({ success: true, data: outlet });
    } catch (err) {
        console.error("Get Outlet By ID Error:", err);
        return res.status(500).json({ success: false, message: 'Failed to fetch outlet' });
    }
}

async function getPopularOutlets(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 4;
        // Aggregate order counts per outlet
        const orderCounts = await Order.aggregate([
            { $group: { _id: '$outletId', orderCount: { $sum: 1 } } },
            { $sort: { orderCount: -1 } }
        ]);
        const outletIds = orderCounts.map(o => o._id);
        const countMap = {};
        orderCounts.forEach(o => { countMap[o._id.toString()] = o.orderCount; });

        // Get all active outlets
        const allOutlets = await Outlet.find({ isSuspended: false });

        // Sort by order count (outlets with orders first, then the rest)
        const sorted = allOutlets.sort((a, b) => {
            const ca = countMap[a._id.toString()] || 0;
            const cb = countMap[b._id.toString()] || 0;
            return cb - ca;
        });

        const popular = sorted.slice(0, limit).map(o => ({
            ...o.toObject(),
            orderCount: countMap[o._id.toString()] || 0
        }));

        return res.status(200).json({ success: true, data: popular });
    } catch (err) {
        console.error('Get Popular Outlets Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch popular outlets' });
    }
}

module.exports = { createOutlet, getOutlets, getOutletById, getPopularOutlets };
