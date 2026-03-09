const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ============================================
// REGISTRO DE USUARIO (SIN VERIFICACIÓN)
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, telefono, direccion, contraseña } = req.body;

        // Validar campos obligatorios
        if (!nombre || !correo || !correo.includes('@') || !contraseña) {
            return res.status(400).json({ error: ' Faltan campos obligatorios' });
        }

        // Verificar si el correo ya está registrado
        const existeUsuario = await User.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({ error: ' El correo ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);

        // Crear usuario
        const nuevoUsuario = new User({
            nombre,
            correo,
            telefono,
            direccion,
            contraseña: contraseñaEncriptada,
            role: correo === 'admin@luxe.com' ? 'admin' : 'cliente'
        });

        await nuevoUsuario.save();

        // Generar token
        const token = jwt.sign(
            { id: nuevoUsuario._id, role: nuevoUsuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                correo: nuevoUsuario.correo,
                role: nuevoUsuario.role,
                direccion: nuevoUsuario.direccion || ''
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// LOGIN (SOLO VALIDACIÓN BÁSICA)
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // Buscar usuario por correo
        const usuario = await User.findOne({ correo });

        // Validar existencia
        if (!usuario) {
            return res.status(401).json({ error: ' Correo no registrado' });
        }

        // Validar contraseña
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar token
        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Respuesta exitosa
        res.json({
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                role: usuario.role,
                direccion: usuario.direccion || ''
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// RUTA PARA VER TODOS LOS USUARIOS (solo pruebas)
// ============================================
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await User.find().select('-contraseña');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/me', verificarToken, async (req, res) => {
    try {
        const user = await User.findById(req.usuarioId).select('-contraseña');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

module.exports = router;