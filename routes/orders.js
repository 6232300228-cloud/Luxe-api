const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: ' No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: ' Token inválido' });
    }
};

// ============================================
// RUTA DE PRUEBA (para verificar que funciona)
// ============================================
router.get('/test', (req, res) => {
    res.json({ mensaje: ' Ruta de pedidos funcionando correctamente' });
});

// ============================================
// CREAR UN NUEVO PEDIDO
// ============================================
router.post('/crear', verificarToken, async (req, res) => {
    try {
        const { usuario, productos, total, metodoPago } = req.body;
        const usuarioId = req.usuarioId;

        console.log(' Recibiendo pedido:', { usuarioId, productos, total });

        const nuevoPedido = new Order({
            usuarioId: usuarioId,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                direccion: usuario.direccion
            },
            productos: productos.map(item => ({
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                imagen: item.imagen || ''
            })),
            total: total,
            metodoPago: metodoPago,
            estado: 'pagado',
            fechaPedido: new Date()
        });

        await nuevoPedido.save();
        console.log(' Pedido guardado con ID:', nuevoPedido._id);

        res.status(201).json({
            mensaje: ' Pedido creado exitosamente',
            pedido: {
                id: nuevoPedido._id,
                total: nuevoPedido.total,
                fecha: nuevoPedido.fechaPedido,
                estado: nuevoPedido.estado
            }
        });

    } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// OBTENER TODOS LOS PEDIDOS (SEGÚN ROL)
// ============================================
router.get('/mis-pedidos', verificarToken, async (req, res) => {
    try {
        let pedidos;
        
        const usuario = await User.findById(req.usuarioId);
        
        if (usuario.role === 'admin' || usuario.role === 'empleado') {
            pedidos = await Order.find().sort({ fechaPedido: -1 });
            console.log(` Admin ${usuario.nombre} viendo ${pedidos.length} pedidos`);
        } else {
            pedidos = await Order.find({ usuarioId: req.usuarioId })
                .sort({ fechaPedido: -1 });
        }

        res.json(pedidos);
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// EXPORTAR ROUTER (¡LO MÁS IMPORTANTE!)
// ============================================
module.exports = router;