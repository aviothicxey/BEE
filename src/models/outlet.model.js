const mongoose = require('mongoose');

const OutletSchema = new mongoose.Schema(
    {
       name: { type: String, required: true, trim: true },
       ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
       image: { type: String, default: "" },
       description: { type: String, default: "" },
       timing: { type: String, default: "" },
       isSuspended: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const Outlet = mongoose.model('Outlet', OutletSchema);
module.exports = Outlet;
