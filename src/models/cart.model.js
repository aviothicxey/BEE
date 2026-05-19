const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        outletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Outlet', default: null },
        totalPrice: { type: Number, required: true, default: 0 },
        items: [
            {
                menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, default: 1 }
            }
        ]
    },
    { timestamps: true }
);

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
