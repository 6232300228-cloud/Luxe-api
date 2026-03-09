const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: String,
    contraseña: { type: String, required: true },
    direccion: String,
    tarjeta: String,
    role: { type: String, default: 'cliente' },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);