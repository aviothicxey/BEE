const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.token;

        if (!token) {
            return next(new AppError(401, 'Access denied. No token provided.'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('id email role isBlocked');

        if (!user) {
            return next(new AppError(401, 'User not found.'));
        }

        if (user.isBlocked) {
            return next(new AppError(403, 'Account is blocked.'));
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = authenticateToken;