const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'rockytrackerofficial@gmail.com',
        pass: 'vuim hvvk yivk lnyr'
    }
});

async function sendWelcomeEmail(to) {
    await transporter.sendMail({
        from: '"RockyTracker" <no-reply@rockytracker.com>',
        to,
        subject: '🎉 Welcome to RockyTracker!',
        html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #2c3e50;">
        <h1 style="font-size: 1.8em;">Welcome to RockyTracker!</h1>
        <p>Thank you for signing up.</p>
        <p>You’ll now receive instant alerts whenever a rockfall is detected on roads or railways across Slovenia.</p>
        <p>These notifications are here to help you stay safe and make smarter travel decisions.</p>
        <p>Whether you're commuting or planning a road trip, we’ve got you covered.</p>

        <p style="margin-top: 20px;">Stay safe out there,</p>
        <p><strong>🪨The RockyTracker Team</strong></p>
        <hr style="margin-top: 30px;" />
        <p style="font-size: 0.9em; color: #888;">If you didn’t sign up for these alerts, feel free to ignore this email or <a href="#">unsubscribe</a>.</p>
      </div>
    `
    });
}


router.post('/api/subscribe', async (req, res) => {
    const { email, consent } = req.body;
    if (!email || !consent) {
        return res.status(400).send('Email + consent required');
    }

    try {
        const check = await pool.query(
            'SELECT 1 FROM subscription_list WHERE email = $1',
            [email]
        );

        if (check.rowCount > 0) {
            return res.status(200).send('You are already subscribed.');
        }

        await pool.query(
            'INSERT INTO subscription_list(email) VALUES ($1)',
            [email]
        );

        res.send('Subscribed! Welcome email will be sent.');

        sendWelcomeEmail(email).catch(err =>
            console.error('Failed to send email:', err)
        );

    } catch (err) {
        console.error('DB error:', err);
        res.status(500).send('DB error');
    }
});

module.exports = router;