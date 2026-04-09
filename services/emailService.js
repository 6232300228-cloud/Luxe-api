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
                <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenida a Luxe Collection</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #fff0f6;
                    font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                }
                .header {
                    background: #ffe4ec;
                    padding: 30px 20px;
                    text-align: center;
                }
                .logo-img {
                    max-width: 120px;
                    height: auto;
                    margin: 0 auto;
                    border-radius: 50%;
                }
                .brand-name {
                    color: #ff4d6d;
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 12px;
                }
                .slogan {
                    color: #666;
                    font-size: 11px;
                    margin-top: 5px;
                }
                .hero {
                    background: #fff0f6;
                    padding: 30px 20px;
                    text-align: center;
                }
                .hero h2 {
                    color: #333;
                    font-size: 26px;
                    margin: 0 0 10px;
                }
                .hero p {
                    color: #666;
                    font-size: 15px;
                }
                .badge {
                    background: #ff4d6d;
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: white;
                    font-size: 11px;
                }
                .content {
                    padding: 30px 24px;
                }
                .section-title {
                    font-size: 20px;
                    color: #333;
                    border-left: 3px solid #ff4d6d;
                    padding-left: 15px;
                    margin: 30px 0 20px;
                }
                .products-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .product {
                    flex: 1;
                    min-width: 160px;
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #f2f2f2;
                    text-align: center;
                    padding: 15px;
                }
                .product-img {
                    width: 100%;
                    height: 150px;
                    object-fit: contain;
                }
                .product-title {
                    font-weight: bold;
                    color: #333;
                    font-size: 14px;
                    margin: 10px 0 5px;
                }
                .price {
                    color: #ff4d6d;
                    font-weight: bold;
                    font-size: 18px;
                }
                .old-price {
                    text-decoration: line-through;
                    color: #aaa;
                    font-size: 13px;
                    margin-left: 5px;
                }
                .btn-product {
                    display: inline-block;
                    background: #ff4d6d;
                    color: white;
                    padding: 8px 20px;
                    border-radius: 30px;
                    text-decoration: none;
                    font-size: 12px;
                    margin-top: 10px;
                }
                .offer-card {
                    background: #fff5f7;
                    border-radius: 16px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: center;
                    border: 1px solid #ffccd5;
                }
                .offer-code {
                    background: #ff4d6d;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 30px;
                    font-size: 20px;
                    display: inline-block;
                    margin-top: 10px;
                    letter-spacing: 2px;
                }
                .btn-primary {
                    background: #ff4d6d;
                    color: white;
                    padding: 14px 30px;
                    border-radius: 50px;
                    text-decoration: none;
                    display: inline-block;
                    margin: 20px 0;
                }
                .footer {
                    background: #fff5f7;
                    color: #666;
                    text-align: center;
                    padding: 25px;
                    font-size: 12px;
                    border-top: 1px solid #ffccd5;
                }
                .footer a {
                    color: #ff4d6d;
                }
                @media (max-width: 600px) {
                    .products-grid {
                        flex-direction: column;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://luxecollection.org/img/logo.png" alt="Luxe Collection" class="logo-img" style="width:120px;">
                    <div class="brand-name">LUXE COLLECTION</div>
                    <div class="slogan">TU DESTINO DE BELLEZA</div>
                </div>

                <div class="hero">
                    <span class="badge">BIENVENIDA</span>
                    <h2>Bienvenida al Club Luxe</h2>
                    <p>Ofertas exclusivas solo para ti</p>
                </div>

                <div class="content">
                    <div class="section-title">Mas vendidos</div>
                    <div class="products-grid">
                        <div class="product">
                            <div class="product-title">Serum Vitamina C</div>
                            <div class="price">$29.90</div>
                            <a href="https://luxecollection.org" class="btn-product">Ver producto</a>
                        </div>
                        <div class="product">
                            <div class="product-title">Mascarilla Hydra</div>
                            <div class="price">$19.90</div>
                            <a href="https://luxecollection.org" class="btn-product">Ver producto</a>
                        </div>
                        <div class="product">
                            <div class="product-title">Iluminador Glow</div>
                            <div class="price">$15.90</div>
                            <a href="https://luxecollection.org" class="btn-product">Ver producto</a>
                        </div>
                    </div>

                    <div class="offer-card">
                        <strong>15% de descuento en tu primera compra</strong><br>
                        Usa el codigo:
                        <div class="offer-code">LUXE15</div>
                    </div>

                    <center>
                        <a href="https://luxecollection.org" class="btn-primary">VER TODAS LAS OFERTAS</a>
                    </center>
                </div>

                <div class="footer">
                    <strong>LUXE COLLECTION</strong><br>
                    Tu destino de belleza<br><br>
                    <a href="https://luxecollection.org">Visitanos</a> | 
                    <a href="#">Darte de baja</a><br>
                    2026 Luxe Collection
                </div>
            </div>
        </body>
        </html>
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