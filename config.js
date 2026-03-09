const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({
            $or: [
                { googleId: profile.id },
                { correo: profile.emails[0].value }
            ]
        });

        if (user) {
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        const nuevoUsuario = new User({
            nombre: profile.displayName,
            correo: profile.emails[0].value,
            googleId: profile.id,
            role: 'cliente'
        });

        await nuevoUsuario.save();
        done(null, nuevoUsuario);
    } catch (error) {
        done(error, null);
    }
}));

module.exports = passport;