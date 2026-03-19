const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

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
// REGISTRO CON VERIFICACIÓN DE EMAIL
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

        // Generar token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24); // Válido por 24 horas

        // Crear usuario
        const nuevoUsuario = new User({
            nombre,
            correo,
            telefono: telefono || '',
            direccion: direccion || '',
            contraseña: contraseñaHash,
            verified: false,
            verificationToken,
            tokenExpires,
            fechaRegistro: new Date()
        });

        await nuevoUsuario.save();
        console.log('✅ Usuario registrado:', correo);

        // Enviar correo de verificación
        if (typeof sendVerificationEmail === 'function') {
            try {
                await sendVerificationEmail(correo, nombre, verificationToken);
                console.log(`✅ Correo de verificación enviado a ${correo}`);
            } catch (emailError) {
                console.error('❌ Error enviando correo:', emailError);
            }
        }

        res.status(201).json({
            mensaje: '✅ Registro exitoso. Por favor verifica tu correo electrónico.',
            requiereVerificacion: true,
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
// VERIFICAR EMAIL
// ============================================
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token requerido' });
        }

        const usuario = await User.findOne({ 
            verificationToken: token,
            tokenExpires: { $gt: new Date() }
        });

        if (!usuario) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        usuario.verified = true;
        usuario.verificationToken = undefined;
        usuario.tokenExpires = undefined;
        await usuario.save();

        console.log('✅ Email verificado:', usuario.correo);

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Email Verificado - Luxe Collection</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #fff5f7; margin: 0; }
                    .container { background: white; padding: 30px 20px; border-radius: 20px; max-width: 500px; margin: 20px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    h1 { color: #ff4d6d; font-size: 24px; }
                    p { color: #333; line-height: 1.6; }
                    .btn { background: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-top: 20px; font-weight: bold; }
                    .btn:hover { background: #ff3355; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ ¡Email Verificado!</h1>
                    <p>Hola <strong>${usuario.nombre}</strong>,</p>
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
// LOGIN
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

        // CASO 2: Usuario no verificado
        if (!usuario.verified) {
            console.log('Usuario no verificado:', correo);
            return res.status(401).json({ 
                error: '❌ Por favor verifica tu correo electrónico antes de iniciar sesión.',
                tipo: 'not_verified',
                correo: usuario.correo
            });
        }

        // CASO 3: Verificar contraseña
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            console.log('Contraseña inválida para:', correo);
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // TODO OK - Generar token
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
// REENVIAR CORREO DE VERIFICACIÓN
// ============================================
router.post('/resend-verification', async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ error: 'Correo requerido' });
        }

        const usuario = await User.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.verified) {
            return res.status(400).json({ error: 'El usuario ya está verificado' });
        }

        if (usuario.googleId) {
            return res.status(400).json({ error: 'Las cuentas de Google no necesitan verificación' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);

        usuario.verificationToken = verificationToken;
        usuario.tokenExpires = tokenExpires;
        await usuario.save();

        if (typeof sendVerificationEmail === 'function') {
            await sendVerificationEmail(usuario.correo, usuario.nombre, verificationToken);
        }

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
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
});

module.exports = router;