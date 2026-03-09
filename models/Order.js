const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    usuario: {
        nombre: String,
        correo: String,
        direccion: String,
        telefono: String
    },
    productos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        nombre: String,
        precio: Number,
        cantidad: Number,
        imagen: String
    }],
    total: {
        type: Number,
        required: true
    },
    metodoPago: {
        type: String,
        enum: ['tarjeta', 'paypal', 'efectivo'],
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    fechaPedido: {
        type: Date,
        default: Date.now
    },
    fechaEntrega: Date,
    notas: String
});

module.exports = mongoose.model('Order', orderSchema);