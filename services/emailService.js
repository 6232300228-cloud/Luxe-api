// services/emailService.js
const sgMail = require('@sendgrid/mail');

// Configurar SendGrid con tu API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, nombre, token) => {
    try {
        const verificationLink = `https://luxe-api-frr5.onrender.com/api/auth/verify-email?token=${token}`;

        const msg = {
            to: email,
            from: {
                email: 'tiendaluxeedb@gmail.com', // El que verificaste
                name: 'Luxe Collection'
            },
            subject: 'Confirma tu cuenta en Luxe Collection ✨',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffc8dd; border-radius: 10px;">
                    <h1 style="color: #ff4d6d;">¡Hola ${nombre}!</h1>
                    <p>Gracias por registrarte en Luxe Collection. Por favor confirma tu correo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                            Confirmar cuenta
                        </a>
                    </div>
                    <p>Si el botón no funciona, copia y pega este enlace:<br>
                    <span style="color: #ff4d6d;">${verificationLink}</span></p>
                    <hr style="border: none; border-top: 1px solid #ffc8dd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">© 2026 Luxe Collection. Todos los derechos reservados.</p>
                </div>
            `
        };

        await sgMail.send(msg);
        console.log(`✅ Correo enviado a ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error:', error.response?.body || error);
        return false;
    }
};

module.exports = { sendVerificationEmail };