const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'https://luxecollection.org/login?error=google' }),
    (req, res) => {
        try {
            const token = jwt.sign(
                { id: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // ✅ CAMBIADO: redirige a login.html con el token
            res.redirect(`https://luxecollection.org/login.html?token=${token}`);
        } catch (error) {
            console.error('Error en callback de Google:', error);
            res.redirect('https://luxecollection.org/login?error=server');
        }
    }
);

module.exports = router;