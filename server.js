app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    
    console.log('Peticion recibida en /api/newsletter:', email);
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ exito: false, error: 'Email invalido' });
    }
    
    try {
        await emailService.enviarNotificacionNewsletter(email);
        await emailService.enviarConfirmacionSuscripcion(email);
        console.log('Newsletter suscrito exitosamente:', email);
        res.json({ exito: true, mensaje: 'Suscripcion exitosa' });
    } catch (error) {
        console.error('Error en newsletter:', error);
        res.status(500).json({ exito: false, error: 'Error al enviar correo: ' + error.message });
    }
});