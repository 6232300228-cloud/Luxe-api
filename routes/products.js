const express = require('express');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

const router = express.Router();

// ============================================
// MIDDLEWARE PARA VERIFICAR TOKEN
// ============================================
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: '❌ No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: '❌ Token inválido' });
    }
};

// ============================================
// RUTA DE PRUEBA
// ============================================
router.get('/test', (req, res) => {
    res.json({ mensaje: '📦 Ruta de productos funcionando correctamente' });
});

// ============================================
// OBTENER TODOS LOS PRODUCTOS
// ============================================
router.get('/', async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// OBTENER PRODUCTO POR ID
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const producto = await Product.findOne({ id: parseInt(req.params.id) });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CREAR PRODUCTO (AGREGAR)
// ============================================
router.post('/crear', verificarToken, async (req, res) => {
    try {
        const { id, name, price, category, brand, img, desc, stock } = req.body;

        if (!id || !name || !price || !category) {
            return res.status(400).json({ error: 'ID, nombre, precio y categoría son requeridos' });
        }

        const existeProducto = await Product.findOne({ id: parseInt(id) });
        if (existeProducto) {
            return res.status(400).json({ error: 'Ya existe un producto con ese ID' });
        }

        const nuevoProducto = new Product({
            id: parseInt(id),
            name,
            price: parseFloat(price),
            category,
            brand: brand || '',
            img: img || 'img/default.png',
            desc: desc || '',
            stock: stock || 100
        });

        await nuevoProducto.save();
        console.log('✅ Producto creado:', name);

        res.status(201).json({
            mensaje: '✅ Producto creado exitosamente',
            producto: nuevoProducto
        });

    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ACTUALIZAR PRODUCTO (EDITAR)
// ============================================
router.put('/actualizar/:id', verificarToken, async (req, res) => {
    try {
        const { name, price, category, brand, img, desc, stock } = req.body;
        const productoId = parseInt(req.params.id);
        
        const producto = await Product.findOne({ id: productoId });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        if (name) producto.name = name;
        if (price) producto.price = parseFloat(price);
        if (category) producto.category = category;
        if (brand) producto.brand = brand;
        if (img) producto.img = img;
        if (desc) producto.desc = desc;
        if (stock !== undefined) producto.stock = parseInt(stock);
        
        await producto.save();
        console.log('✅ Producto actualizado:', producto.name);
        
        res.json({ 
            mensaje: '✅ Producto actualizado exitosamente',
            producto 
        });
        
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ELIMINAR PRODUCTO
// ============================================
router.delete('/eliminar/:id', verificarToken, async (req, res) => {
    try {
        const productoId = parseInt(req.params.id);
        const producto = await Product.findOneAndDelete({ id: productoId });
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        console.log('✅ Producto eliminado:', producto.name);
        res.json({ mensaje: '✅ Producto eliminado exitosamente' });
        
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// REDUCIR STOCK (para cuando se compra)
// ============================================
router.put('/reducir-stock/:productoId', verificarToken, async (req, res) => {
    try {
        const { cantidad } = req.body;
        const producto = await Product.findOne({ id: parseInt(req.params.productoId) });
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        if (producto.stock < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }
        
        producto.stock -= cantidad;
        await producto.save();
        
        res.json({ 
            mensaje: '✅ Stock actualizado', 
            nuevoStock: producto.stock 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CARGAR PRODUCTOS INICIALES (SEED)
// ============================================
router.post('/seed', async (req, res) => {
    try {
        const productosIniciales = [
            { id:1, name:"Labial Cremoso Soft Matte", price:250, category:"labial", img:"img/labial.webp", desc:"Labial suave, matte y de larga duración.", stock:100 },
            { id:2, name:"Ultimate Shadow Palette", price:400, category:"sombra", img:"img/paletas.png", desc:"Paleta profesional con tonos increíbles.", stock:100 },
            { id:3, name:"Can't Stop Foundation", price:350, category:"base", img:"img/base.png", desc:"Base resistente todo el día.", stock:100 },
            { id:4, name:"HD Photogenic Concealer", price:280, category:"corrector", img:"img/corrector.png", desc:"Corrector de alta cobertura y acabado natural.", stock:100 },
            { id:5, name:"Delineador negro waterproof", price:95, category:"ojos", img:"img/delineador.png", desc:"Delineador de alta duración.", stock:100 },
            { id:6, name:"Mascara Lash Sensational", price:180, category:"ojos", img:"img/rimel.png", desc:"Volumen definido.", stock:100 },
            { id:7, name:"Labial Glossy Rosa", price:120, category:"labial", img:"img/labial2.png", desc:"Brillo labial hidratante.", stock:100 },
            { id:8, name:"Set de Brochas Luxe", price:350, category:"accesorios", img:"img/brochas.png", desc:"Set profesional.", stock:100 },
            { id:9, name:"Iluminador Perla Glow", price:210, category:"rostro", img:"img/iluminador.png", desc:"Brillo natural elegante.", stock:100 }
        ];
        
        await Product.deleteMany({});
        await Product.insertMany(productosIniciales);
        
        res.json({ mensaje: '✅ Productos cargados exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;