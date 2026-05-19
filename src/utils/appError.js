class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
        // Mark as validation error if it has details (from Joi validation)
        if (details) {
            this.isValidation = true;
        }
    }
}

module.exports = AppError;
