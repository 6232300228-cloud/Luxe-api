const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true 
    },
    productos: [{
        productoId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product',
            required: true 
        },
        nombre: String,
        precio: Number,
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        imagen: String
    }],
    total: {
        type: Number,
        default: 0
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);