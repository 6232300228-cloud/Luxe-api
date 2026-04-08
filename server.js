const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const { MercadoPagoConfig, Preference } = require("mercadopago");
const emailService = require('./services/emailService');

const app = express();

const mercadopagoClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "APP_USR-5562521962692930-030522-9080c61c1567cf8b93f52eb8a9dfa477-3247325848"
});

app.use(express.json());

app.use(cors({
    origin: [
        'https://luxecollection.org',
        'https://www.luxecollection.org', 
        'https://luxe-api-frr5.onrender.com',
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Manejar explicitamente las peticiones OPTIONS
app.options('*', cors());

app.use(session({
    secret: process.env.SESSION_SECRET || 'luxe-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

console.log('Conectando a MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => {
        console.error('Error conectando a MongoDB:');
        console.error(err);
        process.exit(1);
    });

app.get('/api/auth/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        accessType: 'offline',
        prompt: 'consent',
        session: false
    })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: 'https://luxecollection.org/login.html?error=google' 
    }),
    (req, res) => {
        if (!req.user) {
            console.error('Error: No se recibio usuario de Google');
            return res.redirect('https://luxecollection.org/login.html?error=google');
        }
        
        const token = req.user.token;
        console.log('Login con Google exitoso:', req.user.correo);
        res.redirect(`https://luxecollection.org/login.html?token=${token}`);
    }
);

app.post("/api/crear-preferencia", async (req, res) => {
    try {
        const { items, envio, payer } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ 
                error: "El carrito esta vacio" 
            });
        }

        for (const producto of items) {
            if (!producto.nombre || !producto.precio) {
                return res.status(400).json({ 
                    error: "Datos de producto invalidos" 
                });
            }
        }

        const productosMP = items.map(producto => ({
            title: producto.nombre,
            quantity: Number(producto.cantidad) || 1,
            unit_price: Number(producto.precio),
            currency_id: "MXN"
        }));
        
        const costoEnvio = Number(envio) || 0;
        
        if (costoEnvio > 0) {
            productosMP.push({
                title: "Costo de envio",
                quantity: 1,
                unit_price: costoEnvio,
                currency_id: "MXN"
            });
        }
        
        console.log('Productos a pagar:', productosMP);
        console.log('Total con envio:', productosMP.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0));

        const preference = new Preference(mercadopagoClient);

        const result = await preference.create({
            body: {
                items: productosMP,
                payer: payer ? {
                    name: payer.name,
                    email: payer.email,
                    address: {
                        street_name: payer.address
                    }
                } : undefined,
                back_urls: {
                    success: "https://luxecollection.org/success.html",
                    failure: "https://luxecollection.org/failure.html",
                    pending: "https://luxecollection.org/pending.html"
                },
                auto_return: "approved",
                statement_descriptor: "LUXE COLLECTION",
                external_reference: Date.now().toString()
            }
        });

        res.json({
            init_point: result.init_point,
            id: result.id
        });

    } catch (error) {
        console.error('Error en Mercado Pago:', error);
        res.status(500).json({ 
            error: "Error al crear el pago",
            details: error.message 
        });
    }
});

app.post("/api/webhook-mercadopago", async (req, res) => {
    try {
        const { type, data } = req.body;
        
        console.log('Webhook recibido:', { type, data });
        
        if (type === "payment") {
            const paymentId = data.id;
            console.log('Pago recibido ID:', paymentId);
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error en webhook:', error);
        res.status(500).json({ error: "Error en webhook" });
    }
});

app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ exito: false, error: 'Email invalido' });
    }
    
    try {
        await emailService.enviarNotificacionNewsletter(email);
        await emailService.enviarConfirmacionSuscripcion(email);
        console.log('Newsletter suscrito:', email);
        res.json({ exito: true, mensaje: 'Suscripcion exitosa' });
    } catch (error) {
        console.error('Error en newsletter:', error);
        res.status(500).json({ exito: false, error: 'Error al enviar correo' });
    }
});

app.post('/api/confirmar-compra', async (req, res) => {
    const { emailCliente, datosCompra } = req.body;
    
    if (!emailCliente || !emailCliente.includes('@')) {
        return res.status(400).json({ exito: false, error: 'Email del cliente invalido' });
    }
    
    try {
        await emailService.enviarConfirmacionCompra(emailCliente, datosCompra);
        console.log('Confirmacion de compra enviada a:', emailCliente);
        res.json({ exito: true, mensaje: 'Correo de confirmacion enviado' });
    } catch (error) {
        console.error('Error enviando confirmacion de compra:', error);
        res.status(500).json({ exito: false, error: error.message });
    }
});

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.json({ 
        mensaje: 'API de Luxe Collection funcionando',
        version: '2.3',
        endpoints: {
            auth: '/api/auth',
            google: '/api/auth/google',
            googleCallback: '/auth/google/callback',
            productos: '/api/products',
            carrito: '/api/cart',
            pedidos: '/api/orders',
            mercadopago: '/api/crear-preferencia',
            webhook: '/api/webhook-mercadopago',
            newsletter: '/api/newsletter',
            confirmarCompra: '/api/confirmar-compra'
        }
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        mensaje: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        mercadopago: 'Configurado'
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Google Auth Callback: http://localhost:${PORT}/auth/google/callback`);
    console.log(`Mercado Pago: POST /api/crear-preferencia`);
    console.log(`Newsletter: POST /api/newsletter`);
    console.log(`Confirmacion Compra: POST /api/confirmar-compra`);
    console.log(`El envio se incluye como un item adicional en Mercado Pago`);
});

process.on('uncaughtException', (err) => {
    console.error('Error no capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Promesa rechazada:', err);
    process.exit(1);
});