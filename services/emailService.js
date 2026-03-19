const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    timeout: 10000, // Aumenta el timeout a 10 segundos
    connectionTimeout: 10000
});

transporter.verify((error, success) => {
    if (error) console.log('❌ Error conectando con Gmail:', error);
    else console.log('✅ Servicio de correos listo');
});

const sendVerificationEmail = async (email, nombre, token) => {
    try {
        const verificationLink = `https://luxe-api-frr5.onrender.com/api/auth/verify-email?token=${token}`;
        
        const mailOptions = {
            from: `"Luxe Collection" <${process.env.EMAIL_USER || 'TU_CORREO@gmail.com'}>`,
            to: email,
            subject: 'Confirma tu cuenta en Luxe Collection ✨',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #ff4d6d;">¡Bienvenido a Luxe Collection, ${nombre}!</h1>
                    <p>Por favor confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px;">
                            Confirmar mi cuenta
                        </a>
                    </div>
                    <p>Si el botón no funciona, copia y pega este enlace:<br>
                    <span style="color: #ff4d6d;">${verificationLink}</span></p>
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

module.exports = { sendVerificationEmail };