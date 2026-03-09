const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configurar CORS
// Configurar CORS para producción y local
app.use(cors({
    origin: [
        'https://luxecollection.org',        // Tu web real
        'https://www.luxecollection.org',    // Tu web con www
        'http://127.0.0.1:5500',             // Para que sigas probando en VS Code
        'http://localhost:5500'
    ],
    credentials: true
}));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});