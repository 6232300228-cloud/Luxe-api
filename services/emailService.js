// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarCorreo = async (destinatario, asunto, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Luxe Collection" <LuxeCollection@luxecollection.org>',
            to: destinatario,
            subject: asunto,
            html: html
        });
        console.log('Correo enviado:', info.messageId);
        return { exito: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando correo:', error);
        return { exito: false, error: error.message };
    }
};

const enviarNotificacionNewsletter = async (emailSuscrito) => {
    const asunto = 'Nueva suscripcion al newsletter';
    const html = `
        <h2>Nueva suscripcion al Club Luxe</h2>
        <p><strong>Email:</strong> ${emailSuscrito}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p>Este usuario se ha suscrito al newsletter.</p>
        <hr>
        <p>Luxe Collection</p>
    `;
    return enviarCorreo('LuxeCollection@luxecollection.org', asunto, html);
};

const enviarConfirmacionSuscripcion = async (emailUsuario) => {
    const asunto = 'Bienvenida al Club Luxe';
    const html = `
        <h2>Bienvenida a Luxe Collection</h2>
        <p>Gracias por suscribirte al Club Luxe.</p>
        <p>Recibiras nuestras mejores ofertas exclusivas directamente en tu correo.</p>
        <p>Pronto recibiras novedades y promociones especiales.</p>
        <hr>
        <p>Luxe Collection - Elegancia que inspira</p>
    `;
    return enviarCorreo(emailUsuario, asunto, html);
};

const enviarConfirmacionCompra = async (emailCliente, datosCompra) => {
    const asunto = 'Confirmacion de tu compra - Luxe Collection';
    const html = `
        <h2>Gracias por tu compra</h2>
        <p>Hemos recibido tu pedido correctamente.</p>
        <p><strong>Detalles del pedido:</strong></p>
        <pre>${JSON.stringify(datosCompra, null, 2)}</pre>
        <p>En breve recibiras informacion de envio y seguimiento.</p>
        <hr>
        <p>Luxe Collection - Elegancia que inspira</p>
    `;
    return enviarCorreo(emailCliente, asunto, html);
};

module.exports = { 
    enviarCorreo,
    enviarNotificacionNewsletter,
    enviarConfirmacionSuscripcion,
    enviarConfirmacionCompra
};