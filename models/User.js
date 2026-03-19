const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: { type: String, default: '' },
    direccion: { type: String, default: '' },
    contraseña: { type: String },
    role: { type: String, enum: ['cliente', 'admin', 'empleado'], default: 'cliente' },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    tokenExpires: { type: Date },
    googleId: { type: String },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);