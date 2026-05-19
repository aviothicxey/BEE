const express = require('express');
const passport = require('passport');
const authenticateToken = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validate.middleware');
const { signUpSchema, signInSchema } = require('../validators/auth.validator');
const upload = require('../middlewares/upload.middleware');

const authRouter = express.Router();

authRouter.post('/signup', validateBody(signUpSchema), authController.signUp);
authRouter.post('/signin', validateBody(signInSchema), authController.signIn);

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
authRouter.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
    authController.googleAuthSuccess
);
authRouter.get('/google/failure', (req, res) => {
    return res.status(401).json({
        success: false,
        message: 'Google authentication failed.'
    });
});

authRouter.get('/me', authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

// Profile update: supports optional profile picture upload via multer
authRouter.put('/me/update', authenticateToken, upload.single('pfp'), authController.updateProfile);

module.exports = authRouter;
