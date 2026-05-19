const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { signToken } = require('../utils/jwt');
const path = require('path');
const fs = require('fs');

async function signUp(req, res) {
    const { name, email, phone, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email or phone.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, phone, password: hashedPassword, isGoogleAuth: false });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (err) {
        console.error("Signup Error:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({ success: false, message: `${field} is already registered.` });
        }
        return res.status(500).json({ success: false, message: 'Signup failed, please try again' });
    }
}

async function signIn(req, res) {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    try {
        if (!normalizedEmail || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: 'No account found with this email.' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Account is blocked. Contact support.' });
        }
        if (user.isGoogleAuth && !user.password) {
            return res.status(400).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect password.' });
        }

        const token = signToken({ id: user._id, email: user.email, role: user.role });
        return res.status(200).json({
            success: true,
            message: 'Signin successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, pfp: user.pfp, isGoogleAuth: user.isGoogleAuth }
        });
    } catch (err) {
        console.error("Signin Error:", err);
        return res.status(500).json({ success: false, message: 'Signin failed, please try again' });
    }
}

async function googleAuthSuccess(req, res) {
    const user = req.user;

    if (!user) {
        return res.redirect('/login?error=google_failed');
    }

    // Generate JWT token
    const token = signToken({ id: user._id, email: user.email, role: user.role });

    // Set token as cookie
    res.cookie('token', token, { 
        httpOnly: true, 
        maxAge: 86400000,  // 1 day
        path: '/',
        sameSite: 'lax'
    });

    // Redirect to home page (user is now authenticated)
    const role = user.role;
    if (role === 'superadmin') return res.redirect('/superadmin');
    if (role === 'admin') return res.redirect('/admin');
    return res.redirect('/outlets');
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;

        const updateData = {};
        if (name && name.trim()) updateData.name = name.trim();
        if (phone) updateData.phone = phone;

        // If a profile picture was uploaded via multer
        if (req.file) {
            // Delete old pfp if it exists and isn't a Google photo
            const oldUser = await User.findById(userId);
            if (oldUser && oldUser.pfp && oldUser.pfp.startsWith('/uploads/profiles/')) {
                const oldPath = path.join(__dirname, '../../public', oldUser.pfp);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.pfp = `/uploads/profiles/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                pfp: updatedUser.pfp,
                role: updatedUser.role
            }
        });
    } catch (err) {
        console.error("Update Profile Error:", err);
        return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
}

module.exports = { signUp, signIn, googleAuthSuccess, updateProfile };
