const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware para parsear JSON
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

const session = require('express-session');
const passport = require('./config/passport');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

// Importar y usar rutas de Google
const googleAuthRoutes = require('./routes/googleAuth');
app.use('/api/auth', googleAuthRoutes);

// Conectar a MongoDB
console.log('🔌 Conectando a MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:');
        console.error(err);
    });

// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Luxe funcionando 🚀' });
});

// Ruta de prueba para productos (para verificar que funciona)
app.get('/api/test', (req, res) => {
    res.json({ mensaje: 'API de productos funcionando', rutas: ['/api/products', '/api/auth', '/api/cart', '/api/orders'] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('❌ Promesa rechazada:', err);
});