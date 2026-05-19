const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
    {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 }
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        outletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Outlet', required: true },
        items: { type: [OrderItemSchema], required: true, default: [] },
        totalPrice: { type: Number, required: true, default: 0 },
        orderStatus: {
            type: String,
            enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
            default: 'Pending'
        },
        paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
        paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
        orderNumber: { type: String, required: true, unique: true },
        pickupTime: { type: Date, default: null }
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
