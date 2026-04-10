const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();
// ============================================
// MIDDLEWARE: Verificar Token
// ============================================
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No autorizado - No hay token' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No autorizado - Token vacío' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
// ============================================
// OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
// ============================================
router.get('/usuarios', verificarToken, async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        const usuarioActual = await User.findById(req.usuarioId);
        
        if (usuarioActual.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
        }
        
        // Obtener todos los usuarios, excluyendo contraseñas
        const usuarios = await User.find({}).select('-contraseña').sort({ fechaRegistro: -1 });
        
        console.log(`📋 Admin ${usuarioActual.nombre} consultó ${usuarios.length} usuarios`);
        
        res.json(usuarios);
        
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
    }
});
// ============================================
// REGISTRO - SIN VERIFICACIÓN DE CORREO
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, telefono, direccion, contraseña } = req.body;

        // Verificar campos requeridos
        if (!nombre || !correo || !contraseña) {
            return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existeUsuario = await User.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const contraseñaHash = await bcrypt.hash(contraseña, salt);

        // Crear usuario - VERIFICADO AUTOMÁTICAMENTE
        const nuevoUsuario = new User({
            nombre,
            correo,
            telefono: telefono || '',
            direccion: direccion || '',
            contraseña: contraseñaHash,
            verified: true, // ✅ AUTOMÁTICAMENTE VERIFICADO
            fechaRegistro: new Date()
        });

        await nuevoUsuario.save();
        console.log('✅ Usuario registrado:', correo);

        // Generar token JWT
        const token = jwt.sign(
            { id: nuevoUsuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Responder con token y datos del usuario
        res.status(201).json({
            mensaje: '✅ Registro exitoso',
            token,
            user: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                correo: nuevoUsuario.correo,
                role: nuevoUsuario.role,
                verified: true
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// ============================================
// LOGIN - SIN VERIFICACIÓN DE CORREO
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        console.log('Intento de login:', correo);

        if (!correo || !contraseña) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
        }

        const usuario = await User.findOne({ correo });
        if (!usuario) {
            console.log('Usuario no encontrado:', correo);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('Usuario encontrado:', {
            correo: usuario.correo,
            tieneGoogleId: !!usuario.googleId,
            tieneContraseña: !!usuario.contraseña,
            verified: usuario.verified
        });

        // CASO 1: Usuario de Google
        if (usuario.googleId && !usuario.contraseña) {
            console.log('Intento de login con email en cuenta de Google');
            return res.status(401).json({ 
                error: '❌ Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.',
                tipo: 'google_account'
            });
        }

        // CASO 2: Verificar contraseña
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            console.log('Contraseña inválida para:', correo);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Login exitoso:', correo);

        res.json({
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                role: usuario.role,
                verified: usuario.verified
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// ============================================
// OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
// ============================================
router.get('/usuarios', verificarToken, async (req, res) => {
    console.log('🔍 Endpoint /usuarios llamado');
    
    try {
        // Verificar que el usuario sea admin
        const usuarioActual = await User.findById(req.usuarioId);
        console.log('Usuario actual:', usuarioActual?.correo, 'Rol:', usuarioActual?.role);
        
        if (!usuarioActual || usuarioActual.role !== 'admin') {
            console.log('❌ Acceso denegado - No es admin');
            return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
        }
        
        // Obtener todos los usuarios
        const usuarios = await User.find({}).select('-contraseña').sort({ fechaRegistro: -1 });
        
        console.log(`✅ Admin ${usuarioActual.nombre} consultó ${usuarios.length} usuarios`);
        
        res.json(usuarios);
        
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
    }
});