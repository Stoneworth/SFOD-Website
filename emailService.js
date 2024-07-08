// emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = (email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Your verification code is: ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

const sendPasswordResetEmail = (email, token, req) => {
    const mailOptions = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending password reset email:', error);
        } else {
            console.log('Password reset email sent:', info.response);
        }
    });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
