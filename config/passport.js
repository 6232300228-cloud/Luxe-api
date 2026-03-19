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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Perfil de Google:', profile.emails[0].value);
        
        // Buscar usuario por email O googleId
        let user = await User.findOne({
            $or: [
                { googleId: profile.id },
                { correo: profile.emails[0].value }
            ]
        });

        if (user) {
            console.log('Usuario existente encontrado:', user.correo);
            
            // Si el usuario existe pero no tiene googleId (se registró con email)
            if (!user.googleId) {
                console.log('Vinculando cuenta de Google con usuario existente');
                user.googleId = profile.id;
                user.verified = true; // Los usuarios de Google se verifican automáticamente
                await user.save();
            }
        } else {
            console.log('Creando nuevo usuario con Google');
            // Crear NUEVO usuario de Google
            user = new User({
                nombre: profile.displayName,
                correo: profile.emails[0].value,
                googleId: profile.id,
                role: 'cliente',
                verified: true, // ¡IMPORTANTE! Los usuarios de Google ya están verificados
                fechaRegistro: new Date()
            });
            
            await user.save();
            console.log('Nuevo usuario de Google creado:', user.correo);
        }

        // Generar token JWT para el usuario
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Adjuntar token al usuario para poder enviarlo al frontend
        user.token = token;
        
        return done(null, user);
    } catch (error) {
        console.error('Error en estrategia de Google:', error);
        return done(error, null);
    }
}));

module.exports = passport;