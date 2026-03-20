// /services/emailService.js - VERSIÓN CORREGIDA
const nodemailer = require('nodemailer');

// Configuración del transporter (USANDO GMAIL)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu correo de Gmail
        pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación de Gmail
    }
});

// Función para enviar correo de verificación
const sendVerificationEmail = async (correo, nombre, token) => {
    const verificationLink = `https://luxe-api-frr5.onrender.com/api/auth/verify-email?token=${token}`;
    
    // ✅ CORREGIDO: Usar backticks ` para interpolar variables
    const mailOptions = {
        from: `"Luxe Collection" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: 'Verifica tu correo electrónico - Luxe Collection',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #ff4d6d; margin: 0;">Luxe Collection</h1>
                        <p style="color: #666; font-size: 16px;">Verificación de Email</p>
                    </div>
                    
                    <div style="color: #333; line-height: 1.6;">
                        <p>Hola <strong>${nombre}</strong>,</p>
                        <p>Gracias por registrarte en Luxe Collection. Para completar tu registro y poder iniciar sesión, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="background: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Verificar mi correo</a>
                        </div>
                        
                        <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                        <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">${verificationLink}</p>
                        
                        <p style="margin-top: 30px;">Este enlace expirará en <strong>24 horas</strong>.</p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 14px; text-align: center;">
                            Si no creaste una cuenta en Luxe Collection, ignora este correo.<br>
                            &copy; 2026 Luxe Collection. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de verificación enviado a: ${correo}`);
        console.log(`📧 ID del mensaje: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        console.error('Detalles:', error.message);
        throw error;
    }
};

module.exports = { sendVerificationEmail };