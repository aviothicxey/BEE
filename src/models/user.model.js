const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: {
        type: String,
        required: function () { return !this.isGoogleAuth; },
        unique: true,
        sparse: true,
        minlength: 10,
        maxlength: 10
    },
    password: {
        type: String,
        required: function () { return !this.isGoogleAuth; },
        minlength: 6
    },
    pfp: { type: String, default: "" },
    googleId: { type: String, default: null },
    isGoogleAuth: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "admin", "superadmin"], default: "student" }
},
{ timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
