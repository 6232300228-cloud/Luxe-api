// services/emailService.js - DESHABILITADO TEMPORALMENTE
// Este archivo está deshabilitado porque no se usa la verificación de correo

/*
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (correo, nombre, token) => {
    // ... código comentado ...
};

module.exports = { sendVerificationEmail };
*/

// Exportar función vacía para evitar errores
const sendVerificationEmail = async () => {
    console.log('📧 Servicio de correo deshabilitado');
    return false;
};

module.exports = { sendVerificationEmail };