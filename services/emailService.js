// services/emailService.js
const nodemailer = require('nodemailer');

// 🔧 USAR VARIABLES DE ENTORNO (no valores fijos)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // ← Cambia TU_CORREO@gmail.com por esto
        pass: process.env.EMAIL_PASS   // ← Cambia la contraseña por esto
    }
});

// ✅ Verificar conexión
transporter.verify((error, success) => {
    if (error) console.log('❌ Error conectando con Gmail:', error);
    else console.log('✅ Servicio de correos listo para enviar');
});

// ✅ Enviar correo de verificación
const sendVerificationEmail = async (email, nombre, token) => {
    try {
        // 🔧 Usar el dominio correcto (no localhost, no api.subdominio)
        const verificationLink = `https://luxecollection.org/api/auth/verify-email?token=${token}`;
        
        const mailOptions = {
            from: `"Luxe Collection" <${process.env.EMAIL_USER}>`, // ← Usa variable
            to: email,
            subject: 'Confirma tu cuenta en Luxe Collection ✨',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffc8dd; border-radius: 10px;">
                    <h1 style="color: #ff4d6d;">¡Bienvenido a Luxe Collection, ${nombre}!</h1>
                    <p>Por favor confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                            Confirmar mi cuenta
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Si el botón no funciona, copia y pega este enlace:<br>
                    <span style="color: #ff4d6d;">${verificationLink}</span></p>
                    <hr style="border: none; border-top: 1px solid #ffc8dd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">© 2025 Luxe Collection. Todos los derechos reservados.</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de verificación enviado a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando verificación:', error);
        return false;
    }
};

// ✅ Enviar alerta de inicio de sesión
const sendLoginAlert = async (email, nombre) => {
    try {
        const fecha = new Date().toLocaleString('es-MX', {
            dateStyle: 'full',
            timeStyle: 'medium'
        });
        
        const mailOptions = {
            from: `"Luxe Collection" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Nuevo inicio de sesión en Luxe Collection',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #ff4d6d;">Hola ${nombre}</h1>
                    <p>Se ha iniciado sesión en tu cuenta de Luxe Collection.</p>
                    <p><strong>Fecha y hora:</strong> ${fecha}</p>
                    <p>Si no fuiste tú, te recomendamos cambiar tu contraseña inmediatamente.</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Alerta de login enviada a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando alerta:', error);
        return false;
    }
};

// ✅ Enviar correo de bienvenida
const sendWelcomeEmail = async (email, nombre) => {
    try {
        const mailOptions = {
            from: `"Luxe Collection" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🎉 ¡Bienvenid@ a Luxe Collection!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #ff4d6d;">¡Gracias por unirte, ${nombre}!</h1>
                    <p>Tu cuenta ha sido verificada exitosamente.</p>
                    <p>Ya puedes disfrutar de todos nuestros productos y ofertas exclusivas.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://luxecollection.org" 
                           style="background-color: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px;">
                            Ir a la tienda
                        </a>
                    </div>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de bienvenida enviado a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando bienvenida:', error);
        return false;
    }
};

// ✅ EXPORTAR TODAS LAS FUNCIONES
module.exports = {
    sendVerificationEmail,
    sendLoginAlert,
    sendWelcomeEmail
};