const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

/*
  Passport config: handles Google OAuth login and user creation.
*/

function configurePassport() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
        console.warn('⚠️  Google OAuth credentials missing. Google login will be disabled.');
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const name = profile.displayName || 'Google User';
                    if (!email) {
                        return done(null, false, { message: 'Google account email missing.' });
                    }

                    let user = await User.findOne({ googleId: profile.id });
                    if (!user) {
                        user = await User.findOne({ email });
                    }

                    if (!user) {
                        user = await User.create({
                            name,
                            email,
                            googleId: profile.id,
                            isGoogleAuth: true,
                            role: 'student'
                        });
                    } else {
                        user.googleId = user.googleId || profile.id;
                        user.isGoogleAuth = true;
                        await user.save();
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
}

module.exports = configurePassport;
