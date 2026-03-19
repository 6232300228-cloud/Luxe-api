// ============================================
// routes/cart.js - BACKEND (API para el carrito)
// ============================================
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const jwt = require('jsonwebtoken');

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Obtener carrito del usuario
router.get('/', verificarToken, async (req, res) => {
    try {
        let carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        res.json(carrito || { productos: [], total: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar producto al carrito
router.post('/agregar', verificarToken, async (req, res) => {
    try {
        const { productoId, nombre, precio, cantidad, imagen } = req.body;
        
        let carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        
        if (!carrito) {
            carrito = new Cart({
                usuarioId: req.usuarioId,
                productos: []
            });
        }
        
        const productoExistente = carrito.productos.find(p => p.productoId == productoId);
        
        if (productoExistente) {
            productoExistente.cantidad += cantidad;
        } else {
            carrito.productos.push({
                productoId,
                nombre,
                precio,
                cantidad,
                imagen
            });
        }
        
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        await carrito.save();
        
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto del carrito
router.delete('/eliminar/:productoId', verificarToken, async (req, res) => {
    try {
        const carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        
        carrito.productos = carrito.productos.filter(p => p.productoId != req.params.productoId);
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        await carrito.save();
        
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;