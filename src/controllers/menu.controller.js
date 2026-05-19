const Menu = require('../models/menu.model');

async function createMenuItem(req, res) {
    const { outletId, name, price, image, description } = req.body;
    if (!outletId || !name || price === undefined) {
        return res.status(400).json({ success: false, message: 'Outlet ID, Name and Price are required' });
    }
    try {
        const newMenuItem = await Menu.create({
            outletId,
            name,
            price: parseFloat(price),
            image: image || '',
            description: description || ''
        });
        return res.status(201).json({ success: true, message: 'Menu item created successfully', data: newMenuItem });
    } catch (err) {
        console.error('Create menu error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create menu item' });
    }
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function searchMenuItems(req, res) {
    const { q } = req.query;
    const trimmed = (q || '').trim();
    if (trimmed.length < 2) {
        return res.status(200).json({ success: true, data: [] });
    }

    try {
        const regex = new RegExp(escapeRegex(trimmed), 'i');
        const outletIds = await Menu.find({
            $or: [{ name: regex }, { description: regex }]
        }).distinct('outletId');

        return res.status(200).json({ success: true, data: outletIds });
    } catch (err) {
        console.error('Search menu error:', err);
        return res.status(500).json({ success: false, message: 'Failed to search menu items' });
    }
}

async function getMenuItemsByOutlet(req, res) {
    const { outletId } = req.params;
    try {
        const menuItems = await Menu.find({ outletId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Menu items retrieved successfully', data: menuItems });
    } catch (err) {
        console.error('Get menu items error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve menu items' });
    }
}

async function updateMenuItem(req, res) {
    const { id } = req.params;
    const { name, price, image, description, available } = req.body;
    try {
        const menuItem = await Menu.findById(id);
        if (!menuItem) return res.status(404).json({ success: false, message: 'Menu item not found' });

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (image !== undefined) updateData.image = image;
        if (description !== undefined) updateData.description = description;
        if (available !== undefined) updateData.available = available;

        const updated = await Menu.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({ success: true, message: 'Menu item updated successfully', data: updated });
    } catch (err) {
        console.error('Update menu item error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update menu item' });
    }
}

async function deleteMenuItem(req, res) {
    const { id } = req.params;
    try {
        const menuItem = await Menu.findByIdAndDelete(id);
        if (!menuItem) return res.status(404).json({ success: false, message: 'Menu item not found' });
        return res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
    } catch (err) {
        console.error('Delete menu item error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete menu item' });
    }
}

module.exports = { createMenuItem, getMenuItemsByOutlet, updateMenuItem, deleteMenuItem, searchMenuItems };
