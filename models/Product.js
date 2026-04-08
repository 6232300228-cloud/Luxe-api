const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    price: Number,
    category: String,
    brand: { type: String, default: '' },  
    img: String,
    desc: String,
    stock: { type: Number, default: 100 }
});

module.exports = mongoose.model('Product', productSchema);