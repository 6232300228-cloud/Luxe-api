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
    const asunto = 'Bienvenida al Club Luxe Collection';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luxe Collection - Bienvenida</title>
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
      display: block;
      margin: 0 auto;
      border-radius: 50%;
      background-color: white;
      padding: 10px;
    }
    .brand-name {
      color: #ff4d6d;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-top: 12px;
    }
    .slogan {
      color: #666;
      font-size: 11px;
      letter-spacing: 1px;
      margin-top: 5px;
    }
    .hero {
      background: linear-gradient(135deg, #fff0f6 0%, #ffe4ec 100%);
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
      padding-bottom: 15px;
    }
    .product-img {
      width: 100%;
      height: 150px;
      object-fit: contain;
      padding: 15px;
    }
    .product-title {
      font-weight: bold;
      color: #333;
      font-size: 14px;
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
      background: #c97c7ca1;
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
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
      border: 1px solid #ffccd5;
    }
    .offer-img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #ffe4ec;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    .offer-code {
      background: #ff4d6d;
      color: white;
      padding: 8px 15px;
      border-radius: 30px;
      font-size: 18px;
      display: inline-block;
      margin-top: 8px;
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
      .offer-card {
        flex-direction: column;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <div class="header">
      <img src="https://luxecollection.org/img/logo.png" alt="Luxe Collection" class="logo-img">
      <div class="brand-name">LUXE COLLECTION</div>
      <div class="slogan">TU DESTINO DE BELLEZA</div>
    </div>

    <div class="hero">
      <span class="badge">NUEVO</span>
      <h2>Bienvenida al Club</h2>
      <p>Ofertas exclusivas solo para ti</p>
    </div>

    <div class="content">
      
      <div class="section-title">Mas vendidos</div>
      <div class="products-grid">
        <div class="product">
          <div class="product-img">💄</div>
          <div class="product-title">Serum Vitamina C</div>
          <div><span class="price">$29.90</span> <span class="old-price">$49.90</span></div>
          <a href="https://luxecollection.org" class="btn-product">Comprar</a>
        </div>
        <div class="product">
          <div class="product-img">🧴</div>
          <div class="product-title">Mascarilla Hydra</div>
          <div><span class="price">$19.90</span> <span class="old-price">$35.90</span></div>
          <a href="https://luxecollection.org" class="btn-product">Comprar</a>
        </div>
        <div class="product">
          <div class="product-img">✨</div>
          <div class="product-title">Iluminador Glow</div>
          <div><span class="price">$15.90</span></div>
          <a href="https://luxecollection.org" class="btn-product">Comprar</a>
        </div>
      </div>

      <div class="section-title">Oferta para nuevos suscriptores</div>
      <div class="offer-card">
        <div class="offer-img">🎁</div>
        <div class="offer-text">
          <strong>15% de descuento en tu primera compra</strong><br>
          Usa el código:
          <div class="offer-code">LUXE15</div>
        </div>
      </div>

      <div class="section-title">Proximos lanzamientos</div>
      <div class="products-grid">
        <div class="product">
          <div class="product-img">🌸</div>
          <div class="product-title">Coleccion Primavera</div>
          <small>Disponible: 20/04/2026</small>
        </div>
        <div class="product">
          <div class="product-img">👑</div>
          <div class="product-title">Paleta Gold Edition</div>
          <small>Preventa exclusiva</small>
        </div>
      </div>

      <center>
        <a href="https://luxecollection.org" class="btn-primary">VER TODAS LAS OFERTAS</a>
      </center>
    </div>

    <div class="footer">
      <strong>LUXE COLLECTION</strong><br>
      Tu destino de belleza<br><br>
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
    
    let itemsHtml = '';
    let totalCompra = 0;
    
    if (datosCompra && datosCompra.productos && datosCompra.productos.length > 0) {
        datosCompra.productos.forEach(item => {
            const cantidad = item.cantidad || 1;
            const precio = item.precio || 0;
            const subtotal = precio * cantidad;
            totalCompra += subtotal;
         itemsHtml += `
    <div style="display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #f2f2f2;">
        <div style="width: 60px; height: 60px; border-radius: 10px; overflow: hidden; background: #ffe4ec; display: flex; align-items: center; justify-content: center;">
            ${item.imagen ? 
                `<img src="${item.imagen}" alt="${item.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<span style="font-size: 24px;">💄</span>`
            }
        </div>
        <div style="flex: 1;">
            <div style="font-weight: bold; color: #333;">${item.nombre || 'Producto'}</div>
            <div style="color: #666; font-size: 12px;">Cantidad: ${cantidad}</div>
        </div>
        <div style="color: #ff4d6d; font-weight: bold;">$${subtotal.toFixed(2)}</div>
    </div>
`;
        });
    }
    
    const envioCosto = datosCompra.envio || 0;
    const totalFinal = totalCompra + envioCosto;
    const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    const numeroPedido = Math.floor(Math.random() * 1000000);
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luxe Collection - Confirmacion de Compra</title>
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
      display: block;
      margin: 0 auto;
      border-radius: 50%;
      background-color: white;
      padding: 10px;
    }
    .brand-name {
      color: #ff4d6d;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-top: 12px;
    }
    .slogan {
      color: #666;
      font-size: 11px;
      letter-spacing: 1px;
      margin-top: 5px;
    }
    .hero {
      background: linear-gradient(135deg, #fff0f6 0%, #ffe4ec 100%);
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
      background: #28a745;
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
      border-left: 3px solid #28a745;
      padding-left: 15px;
      margin: 30px 0 20px;
    }
    .order-number {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 20px;
      text-align: center;
    }
    .order-number span {
      font-weight: bold;
      color: #ff4d6d;
    }
    .summary-card {
      background: #f8f9fa;
      border-radius: 16px;
      padding: 20px;
      margin: 20px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .summary-row.total {
      border-top: 1px solid #ddd;
      margin-top: 8px;
      padding-top: 12px;
      font-weight: bold;
      font-size: 18px;
      color: #ff4d6d;
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
  </style>
</head>
<body>
  <div class="container">
    
    <div class="header">
      <img src="https://luxecollection.org/img/logo.png" alt="Luxe Collection" class="logo-img">
      <div class="brand-name">LUXE COLLECTION</div>
      <div class="slogan">TU DESTINO DE BELLEZA</div>
    </div>

    <div class="hero">
      <span class="badge">PAGO CONFIRMADO</span>
      <h2>¡Gracias por tu compra!</h2>
      <p>Hemos recibido tu pedido correctamente</p>
    </div>

    <div class="content">
      
      <div class="order-number">
        Pedido #: <span>${numeroPedido}</span><br>
        <small>${fecha}</small>
      </div>

      <div class="section-title">Resumen de tu pedido</div>
      
      ${itemsHtml || '<p>No hay productos en el pedido</p>'}
      
      <div class="summary-card">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${totalCompra.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Envio</span>
          <span>${envioCosto === 0 ? 'GRATIS' : '$' + envioCosto.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>TOTAL</span>
          <span>$${totalFinal.toFixed(2)} MXN</span>
        </div>
      </div>

      <div class="section-title">Informacion de envio</div>
      <div style="background: #fff5f7; padding: 15px; border-radius: 12px;">
        <p><strong>Direccion:</strong> ${datosCompra.direccion || 'Pendiente de confirmar'}</p>
        <p><strong>Metodo de pago:</strong> ${datosCompra.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Tarjeta de Credito/Debito'}</p>
      </div>

      <div style="background: #fff5f7; padding: 15px; border-radius: 12px; margin-top: 20px;">
        <p><strong>Que sigue?</strong></p>
        <p>En las proximas 24 horas recibiras un correo con el numero de guia y seguimiento de tu pedido.</p>
      </div>

      <center>
        <a href="https://luxecollection.org" class="btn-primary">SEGUIR COMPRANDO</a>
      </center>
    </div>

    <div class="footer">
      <strong>LUXE COLLECTION</strong><br>
      Tu destino de belleza<br><br>
      ¿Preguntas? Escríbenos a <a href="mailto:LuxeCollection@luxecollection.org">LuxeCollection@luxecollection.org</a><br>
      2026 Luxe Collection
    </div>
  </div>
</body>
</html>
    `;
    
    return enviarCorreo(emailCliente, asunto, html);
};

module.exports = { 
    enviarCorreo,
    enviarNotificacionNewsletter,
    enviarConfirmacionSuscripcion,
    enviarConfirmacionCompra
};