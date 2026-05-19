const Cart = require('../models/cart.model');
const Menu = require('../models/menu.model');

function getUserId(req) {
    return req.user?.id || req.user?._id || req.user?.userId;
}

function calculateTotalPrice(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

async function addToCart(req, res) {
    const userId = getUserId(req);
    const { menuItemId, quantity } = req.body;

    if (!userId || !menuItemId || !quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Menu item ID and valid quantity are required.' });
    }

    try {
        const menuItem = await Menu.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found.' });
        }
        if (!menuItem.available) {
            return res.status(400).json({ success: false, message: 'This item is currently unavailable.' });
        }

        // FIX: Use parseFloat + fallback to handle any residual string prices
        const menuPrice = parseFloat(menuItem.price);
        if (isNaN(menuPrice) || menuPrice <= 0) {
            return res.status(400).json({ success: false, message: 'Menu item has an invalid price.' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({
                userId,
                outletId: menuItem.outletId,
                items: [{ menuItemId: menuItem._id, name: menuItem.name, price: menuPrice, quantity }],
                totalPrice: menuPrice * quantity
            });
            return res.status(201).json({ success: true, message: 'Item added to cart.', data: cart });
        }

        // FIX: Clear helpful error when user tries to mix outlets
        if (cart.outletId && cart.outletId.toString() !== menuItem.outletId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Your cart has items from a different outlet. Clear your cart first to order from this outlet.'
            });
        }

        const existingItem = cart.items.find(item => item.menuItemId.toString() === menuItemId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ menuItemId: menuItem._id, name: menuItem.name, price: menuPrice, quantity });
        }

        if (!cart.outletId) cart.outletId = menuItem.outletId;

        cart.totalPrice = calculateTotalPrice(cart.items);
        await cart.save();

        return res.status(200).json({ success: true, message: 'Cart updated.', data: cart });
    } catch (err) {
        console.error('Add to cart error:', err);
        return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
    }
}

async function getCart(req, res) {
    const userId = getUserId(req);
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart is empty.',
                data: { userId, outletId: null, items: [], totalPrice: 0 }
            });
        }
        return res.status(200).json({ success: true, message: 'Cart fetched.', data: cart });
    } catch (err) {
        console.error('Get cart error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
    }
}

async function updateCartItem(req, res) {
    const userId = getUserId(req);
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || !quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Menu item ID and valid quantity are required.' });
    }

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

        const item = cart.items.find(e => e.menuItemId.toString() === menuItemId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart.' });

        item.quantity = quantity;
        cart.totalPrice = calculateTotalPrice(cart.items);
        await cart.save();

        return res.status(200).json({ success: true, message: 'Cart updated.', data: cart });
    } catch (err) {
        console.error('Update cart error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update cart.' });
    }
}

async function removeCartItem(req, res) {
    const userId = getUserId(req);
    const { menuItemId } = req.body;

    if (!menuItemId) return res.status(400).json({ success: false, message: 'Menu item ID is required.' });

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

        const originalCount = cart.items.length;
        cart.items = cart.items.filter(item => item.menuItemId.toString() !== menuItemId);

        if (cart.items.length === originalCount) {
            return res.status(404).json({ success: false, message: 'Item not found in cart.' });
        }

        if (cart.items.length === 0) cart.outletId = null;

        cart.totalPrice = calculateTotalPrice(cart.items);
        await cart.save();

        return res.status(200).json({ success: true, message: 'Item removed.', data: cart });
    } catch (err) {
        console.error('Remove cart item error:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove item.' });
    }
}

async function clearCart(req, res) {
    const userId = getUserId(req);
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(200).json({
                success: true, message: 'Cart already empty.',
                data: { userId, outletId: null, items: [], totalPrice: 0 }
            });
        }
        cart.items = [];
        cart.outletId = null;
        cart.totalPrice = 0;
        await cart.save();
        return res.status(200).json({ success: true, message: 'Cart cleared.', data: cart });
    } catch (err) {
        console.error('Clear cart error:', err);
        return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
    }
}

module.exports = { addToCart, getCart, updateCartItem, removeCartItem, clearCart };
