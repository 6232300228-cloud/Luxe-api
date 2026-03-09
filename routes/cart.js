const express = require('express');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');

const router = express.Router();

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ============================================
// RUTA DE PRUEBA (para verificar que funciona)
// ============================================
router.get('/test', (req, res) => {
    res.json({ mensaje: '🛒 Ruta de carrito funcionando correctamente' });
});

// ============================================
// OBTENER CARRITO DEL USUARIO
// ============================================
router.get('/', verificarToken, async (req, res) => {
    try {
        let carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        if (!carrito) {
            carrito = new Cart({ 
                usuarioId: req.usuarioId, 
                productos: [], 
                total: 0 
            });
            await carrito.save();
        }
        res.json(carrito);
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// AGREGAR PRODUCTO AL CARRITO
// ============================================
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
        
        const existeProducto = carrito.productos.find(p => p.productoId.toString() === productoId);
        
        if (existeProducto) {
            existeProducto.cantidad += cantidad || 1;
        } else {
            carrito.productos.push({
                productoId,
                nombre,
                precio,
                cantidad: cantidad || 1,
                imagen
            });
        }
        
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        await carrito.save();
        res.json(carrito);
        
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// ELIMINAR PRODUCTO DEL CARRITO
// ============================================
router.delete('/eliminar/:productoId', verificarToken, async (req, res) => {
    try {
        const carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        
        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        
        carrito.productos = carrito.productos.filter(p => p._id.toString() !== req.params.productoId);
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        await carrito.save();
        res.json(carrito);
        
    } catch (error) {
        console.error('Error eliminando del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// VACIAR CARRITO COMPLETO
// ============================================
router.delete('/vaciar', verificarToken, async (req, res) => {
    try {
        const carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        
        if (carrito) {
            carrito.productos = [];
            carrito.total = 0;
            await carrito.save();
        }
        
        res.json({ mensaje: ' Carrito vaciado' });
        
    } catch (error) {
        console.error('Error vaciando carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// EXPORTAR ROUTER (¡LO MÁS IMPORTANTE!)
// ============================================
module.exports = router;