const AppError = require('../utils/appError');

function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return next(new AppError(401, 'Unauthorized. User role missing.'));
        }
        if (!allowedRoles.includes(userRole)) {
            return next(new AppError(403, 'Access denied. Insufficient role.'));
        }
        return next();
    };
}

module.exports = { requireRole };
