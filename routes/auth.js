const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // 🆕 Para generar tokens únicos
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService'); // 🆕

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
// REGISTRO CON VERIFICACIÓN DE EMAIL 🆕
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, telefono, direccion, contraseña } = req.body;

        // Verificar si el usuario ya existe
        const existeUsuario = await User.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const contraseñaHash = await bcrypt.hash(contraseña, salt);

        // 🆕 Generar token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24); // Válido por 24 horas

        // Crear usuario con campos de verificación
        const nuevoUsuario = new User({
            nombre,
            correo,
            telefono,
            direccion,
            contraseña: contraseñaHash,
            verified: false,
            verificationToken,
            tokenExpires
        });

        await nuevoUsuario.save();

        // 🆕 Enviar correo de verificación
        try {
            await sendVerificationEmail(correo, nombre, verificationToken);
            console.log(`✅ Correo de verificación enviado a ${correo}`);
        } catch (emailError) {
            console.error('❌ Error enviando correo:', emailError);
            // El usuario se creó pero el correo no se envió
            return res.status(201).json({ 
                mensaje: 'Usuario creado, pero hubo un problema enviando el correo. Contacta a soporte.',
                requiereVerificacion: true
            });
        }

        // Generar token (opcional: no generar hasta que verifique)
        const token = jwt.sign(
            { id: nuevoUsuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            mensaje: '✅ Registro exitoso. Por favor verifica tu correo electrónico.',
            token,
            user: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                correo: nuevoUsuario.correo,
                role: nuevoUsuario.role,
                verified: false
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// ============================================
// 🆕 VERIFICAR EMAIL
// ============================================
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        // Buscar usuario con ese token
        const usuario = await User.findOne({ 
            verificationToken: token,
            tokenExpires: { $gt: new Date() } // Token no expirado
        });

        if (!usuario) {
            return res.status(400).json({ 
                error: 'Token inválido o expirado' 
            });
        }

        // Actualizar usuario
        usuario.verified = true;
        usuario.verificationToken = undefined;
        usuario.tokenExpires = undefined;
        await usuario.save();

        // Respuesta HTML para mejor experiencia
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Email Verificado - Luxe Collection</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #fff5f7; }
                    .container { background: white; padding: 40px; border-radius: 20px; max-width: 500px; margin: 0 auto; }
                    h1 { color: #ff4d6d; }
                    .btn { background: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ ¡Email Verificado!</h1>
                    <p>Tu cuenta ha sido verificada exitosamente.</p>
                    <p>Ya puedes iniciar sesión en Luxe Collection.</p>
                    <a href="https://luxecollection.org/login.html" class="btn">Ir a Iniciar Sesión</a>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Error verificando email:', error);
        res.status(500).json({ error: 'Error al verificar email' });
    }
});

// ============================================
// LOGIN CON VERIFICACIÓN 🆕
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // Buscar usuario
        const usuario = await User.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // 🆕 Verificar si el email está confirmado
        if (!usuario.verified) {
            return res.status(401).json({ 
                error: '❌ Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.'
            });
        }

        // Verificar contraseña
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                role: usuario.role
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// ============================================
// 🆕 REENVIAR CORREO DE VERIFICACIÓN
// ============================================
router.post('/resend-verification', async (req, res) => {
    try {
        const { correo } = req.body;

        const usuario = await User.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.verified) {
            return res.status(400).json({ error: 'El usuario ya está verificado' });
        }

        // Generar nuevo token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);

        usuario.verificationToken = verificationToken;
        usuario.tokenExpires = tokenExpires;
        await usuario.save();

        // Enviar correo
        await sendVerificationEmail(usuario.correo, usuario.nombre, verificationToken);

        res.json({ mensaje: '✅ Correo de verificación reenviado' });

    } catch (error) {
        console.error('Error reenviando:', error);
        res.status(500).json({ error: 'Error al reenviar correo' });
    }
});

// ============================================
// OBTENER DATOS DEL USUARIO ACTUAL
// ============================================
router.get('/me', verificarToken, async (req, res) => {
    try {
        const usuario = await User.findById(req.usuarioId).select('-contraseña');
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
});

module.exports = router;