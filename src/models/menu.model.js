const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema(
    {
        outletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        // FIX: Was String - caused NaN price errors in cart/order controllers
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        available: {
            type: Boolean,
            default: true
        },
        isVeg: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const Menu = mongoose.model('Menu', MenuSchema);
module.exports = Menu;