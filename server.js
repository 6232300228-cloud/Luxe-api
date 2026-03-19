const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

// Importar MercadoPago
const mercadopago = require("mercadopago");
// O si usas la nueva versión:
const { MercadoPagoConfig, Preference } = require("mercadopago");
const app = express();

// ============================================
// CONFIGURACIÓN DE MERCADO PAGO
// ============================================
const mercadopagoClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "APP_USR-5562521962692930-030522-9080c61c1567cf8b93f52eb8a9dfa477-3247325848"
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());

// Configurar CORS actualizado
app.use(cors({
    origin: [
        'https://luxecollection.org',
        'https://www.luxecollection.org', 
        'https://luxe-api-frr5.onrender.com',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    credentials: true
}));

// Configurar sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'luxe-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// CONEXIÓN A MONGODB
// ============================================
console.log('🔌 Conectando a MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:');
        console.error(err);
        process.exit(1); // Salir si no hay DB
    });

// ============================================
// RUTAS DE MERCADO PAGO (¡NUEVO!)
// ============================================
app.post("/api/crear-preferencia", async (req, res) => {
    try {
        const carrito = req.body.items;

        if (!carrito || carrito.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        const items = carrito.map(producto => ({
            title: producto.nombre,
            quantity: Number(producto.cantidad) || 1,
            unit_price: Number(producto.precio),
            currency_id: "MXN"
        }));

        const preference = new Preference(mercadopagoClient);

        const result = await preference.create({
            body: {
                items: items,
                back_urls: {
                    success: "https://luxecollection.org/success.html",
                    failure: "https://luxecollection.org/failure.html",
                    pending: "https://luxecollection.org/pending.html"
                },
                auto_return: "approved",
                statement_descriptor: "LUXE COLLECTION"
            }
        });

        res.json({
            init_point: result.init_point,
            id: result.id
        });

    } catch (error) {
        console.error('❌ Error en Mercado Pago:', error);
        res.status(500).json({ 
            error: "Error al crear pago",
            details: error.message 
        });
    }
});

// ============================================
// IMPORTAR RUTAS EXISTENTES
// ============================================
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// ============================================
// USAR RUTAS
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes); // Rutas de Google Auth
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ============================================
// RUTAS DE PRUEBA
// ============================================
app.get('/', (req, res) => {
    res.json({ 
        mensaje: '🚀 API de Luxe Collection funcionando',
        version: '2.0',
        endpoints: {
            auth: '/api/auth',
            google: '/api/auth/google',
            productos: '/api/products',
            carrito: '/api/cart',
            pedidos: '/api/orders',
            mercadopago: '/api/crear-preferencia'
        }
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        mensaje: '✅ API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('❌ Error del servidor:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
});

// ============================================
// MANEJO DE PROCESOS
// ============================================
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Promesa rechazada:', err);
    process.exit(1);
});