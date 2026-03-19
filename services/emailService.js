// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para 465, false para otros puertos
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 30000, // 30 segundos
    greetingTimeout: 30000,
    socketTimeout: 30000
});

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Error conectando con Gmail:');
        console.log('Detalles del error:', error);
        console.log('📧 Verifica en Render:');
        console.log('1. EMAIL_USER =', process.env.EMAIL_USER);
        console.log('2. EMAIL_PASS debe ser contraseña de aplicación');
    } else {
        console.log('✅ Servicio de correos listo');
    }
});

const sendVerificationEmail = async (email, nombre, token) => {
    try {
        const verificationLink = `https://luxe-api-frr5.onrender.com/api/auth/verify-email?token=${token}`;
        
        const mailOptions = {
            from: `"Luxe Collection" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Confirma tu cuenta en Luxe Collection ✨',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #ff4d6d;">¡Hola ${nombre}!</h1>
                    <p>Confirma tu correo:</p>
                    <a href="${verificationLink}" style="background: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px;">
                        Confirmar
                    </a>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };