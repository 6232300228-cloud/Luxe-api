const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Campos existentes
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: String,
    contraseña: { type: String }, // Opcional (para usuarios de Google)
    direccion: String,
    tarjeta: String,
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, default: 'cliente' },
    fechaRegistro: { type: Date, default: Date.now },

    // 🆕 NUEVOS CAMPOS PARA VERIFICACIÓN DE EMAIL
    verified: { 
        type: Boolean, 
        default: false 
    },
    verificationToken: { 
        type: String 
    },
    tokenExpires: { 
        type: Date 
    }
});

module.exports = mongoose.model('User', userSchema);