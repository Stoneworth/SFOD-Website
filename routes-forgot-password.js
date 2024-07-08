require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const { User } = require('./database');
const { sendPasswordResetEmail } = require('./emailService');

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No account with that email address exists.' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        sendPasswordResetEmail(email, token, req);

        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('Error during forgot password', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/reset/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        res.render('reset-password', { token: req.params.token });
    } catch (error) {
        console.error('Error during password reset', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/reset/:token', async (req, res) => {
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const salt = user.salt; // Retrieve the salt from the user object

        crypto.pbkdf2(password, salt, 100000, 64, 'sha512', async (err, derivedKey) => {
            if (err) {
                console.error('Error during password hashing', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            const newHashedPassword = derivedKey.toString('hex');

            // Update user's password and clear reset token
            user.password = newHashedPassword; // Ensure to hash the password before saving it
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.status(200).json({ message: 'Password has been reset successfully.' });
        });
    } catch (error) {
        console.error('Error during password reset', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;