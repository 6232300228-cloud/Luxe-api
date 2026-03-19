const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Serializar usuario (guardar ID en sesión)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserializar usuario (obtener datos completos)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback' // Esta ruta debe coincidir con la de server.js
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔍 Procesando login con Google:', profile.emails[0].value);
        
        // Buscar usuario existente por email O googleId
        let user = await User.findOne({
            $or: [
                { googleId: profile.id },
                { correo: profile.emails[0].value }
            ]
        });

        if (user) {
            console.log('👤 Usuario existente encontrado:', user.correo);
            
            // Si el usuario existe pero no tiene googleId (se registró con email)
            if (!user.googleId) {
                console.log('🔄 Vinculando cuenta de Google con usuario existente');
                user.googleId = profile.id;
                user.verified = true; // Los usuarios de Google se verifican automáticamente
                await user.save();
            }
        } else {
            console.log('🆕 Creando nuevo usuario con Google');
            // Crear nuevo usuario de Google
            user = new User({
                nombre: profile.displayName,
                correo: profile.emails[0].value,
                googleId: profile.id,
                role: 'cliente',
                verified: true, // ¡CRÍTICO! Los usuarios de Google ya están verificados
                fechaRegistro: new Date()
            });
            
            await user.save();
            console.log('✅ Nuevo usuario de Google creado:', user.correo);
        }

        // Generar token JWT para el usuario
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Adjuntar token al usuario para enviarlo al frontend
        user.token = token;
        
        return done(null, user);
    } catch (error) {
        console.error('❌ Error en estrategia de Google:', error);
        return done(error, null);
    }
}));

module.exports = passport;