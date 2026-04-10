const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

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
        return res.status(401).json({ error: 'Token invalido' });
    }
};

// ============================================
// RUTA DE PRUEBA
// ============================================
router.get('/test', (req, res) => {
    res.json({ mensaje: 'Ruta de pedidos funcionando correctamente' });
});

// ============================================
// CREAR UN NUEVO PEDIDO
// ============================================
router.post('/crear', verificarToken, async (req, res) => {
    console.log('===== CREAR PEDIDO =====');
    console.log('Usuario ID:', req.usuarioId);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { usuario, productos, total, metodoPago } = req.body;
        
        // Validar datos requeridos
        if (!usuario || !productos || !productos.length || !total) {
            console.log('ERROR: Faltan datos requeridos');
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        
        // Verificar que el usuario existe
        const userExists = await User.findById(req.usuarioId);
        if (!userExists) {
            console.log('ERROR: Usuario no encontrado:', req.usuarioId);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Crear el pedido
        const nuevoPedido = new Order({
            usuarioId: req.usuarioId,
            usuario: {
                nombre: usuario.nombre || '',
                correo: usuario.correo || '',
                direccion: usuario.direccion || '',
                telefono: usuario.telefono || ''
            },
            productos: productos.map(item => ({
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                imagen: item.imagen || ''
            })),
            total: total,
            metodoPago: metodoPago || 'tarjeta',
            estado: 'pagado',
            fechaPedido: new Date()
        });
        
        console.log('Pedido creado, guardando en MongoDB...');
        
        const pedidoGuardado = await nuevoPedido.save();
        
        console.log('Pedido guardado con ID:', pedidoGuardado._id);
        
        res.status(201).json({
            mensaje: 'Pedido creado exitosamente',
            pedido: {
                id: pedidoGuardado._id,
                total: pedidoGuardado.total,
                fecha: pedidoGuardado.fechaPedido,
                estado: pedidoGuardado.estado
            }
        });
        
    } catch (error) {
        console.error('ERROR en crear pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
});

// ============================================
// OBTENER TODOS LOS PEDIDOS
// ============================================
router.get('/mis-pedidos', verificarToken, async (req, res) => {
    try {
        const usuario = await User.findById(req.usuarioId);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        let pedidos;
        if (usuario.role === 'admin' || usuario.role === 'empleado') {
            pedidos = await Order.find().sort({ fechaPedido: -1 });
        } else {
            pedidos = await Order.find({ usuarioId: req.usuarioId }).sort({ fechaPedido: -1 });
        }
        
        res.json(pedidos);
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// OBTENER UN PEDIDO POR ID
// ============================================
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea válido
        if (!id || id.length !== 24) {
            return res.status(400).json({ error: 'ID de pedido invalido' });
        }
        
        const pedido = await Order.findById(id);
        
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        // Verificar que el usuario sea el dueño del pedido o admin
        const usuario = await User.findById(req.usuarioId);
        if (pedido.usuarioId.toString() !== req.usuarioId && usuario.role !== 'admin') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        res.json(pedido);
    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;