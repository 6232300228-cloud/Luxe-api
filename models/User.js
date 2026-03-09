const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: String,
    contraseña: { type: String }, // ⬅️ Ya no es required: true (porque los de Google no tienen)
    direccion: String,
    tarjeta: String,
    googleId: { type: String, unique: true, sparse: true }, // ⬅️ NUEVO
    role: { type: String, default: 'cliente' },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);