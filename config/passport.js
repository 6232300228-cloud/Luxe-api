const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// 🟢 IMPORTANTE: Los scopes NO van aquí dentro de la estrategia
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://luxe-api-frr5.onrender.com/auth/google/callback' // Debe coincidir con Google Console
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔍 Procesando login con Google:', profile.emails[0].value);
        
        let user = await User.findOne({
            $or: [
                { googleId: profile.id },
                { correo: profile.emails[0].value }
            ]
        });

        if (user) {
            if (!user.googleId) {
                user.googleId = profile.id;
                user.verified = true;
                await user.save();
            }
        } else {
            user = new User({
                nombre: profile.displayName,
                correo: profile.emails[0].value,
                googleId: profile.id,
                role: 'cliente',
                verified: true,
                fechaRegistro: new Date()
            });
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.token = token;
        return done(null, user);
    } catch (error) {
        console.error('❌ Error:', error);
        return done(error, null);
    }
}));

module.exports = passport;