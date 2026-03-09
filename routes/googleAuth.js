const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'https://luxecollection.org/login.html?error=google' }),
    (req, res) => {
        try {
            const token = jwt.sign(
                { id: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // ✅ NUEVO: Redirige DIRECTAMENTE al index.html
            res.redirect(`https://luxecollection.org/index.html?token=${token}`);
        } catch (error) {
            console.error('Error en callback de Google:', error);
            res.redirect('https://luxecollection.org/login.html?error=server');
        }
    }
);

module.exports = router;