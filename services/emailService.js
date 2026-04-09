const fetch = require('node-fetch');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LISTA_ID = 5;

const anadirContactoABrevo = async (email) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                email: email,
                listIds: [BREVO_LISTA_ID],
                updateEnabled: true
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error('Error Brevo:', error);
            return { exito: false, error: error };
        }
        
        console.log('Contacto añadido a Brevo:', email);
        return { exito: true };
        
    } catch (error) {
        console.error('Error conectando con Brevo:', error);
        return { exito: false, error: error.message };
    }
};

const enviarNotificacionNewsletter = async (emailSuscrito) => {
    console.log('Nuevo suscriptor:', emailSuscrito);
    return { exito: true };
};

const enviarConfirmacionSuscripcion = async (emailUsuario) => {
    console.log('Añadiendo suscriptor a Brevo:', emailUsuario);
    return anadirContactoABrevo(emailUsuario);
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
    
    try {
        const info = await transporter.sendMail({
            from: '"Luxe Collection" <LuxeCollection@luxecollection.org>',
            to: emailCliente,
            subject: asunto,
            html: html
        });
        return { exito: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando confirmacion de compra:', error);
        return { exito: false, error: error.message };
    }
};

module.exports = { 
    enviarNotificacionNewsletter,
    enviarConfirmacionSuscripcion,
    enviarConfirmacionCompra,
    anadirContactoABrevo
};