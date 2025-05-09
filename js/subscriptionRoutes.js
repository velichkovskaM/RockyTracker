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
        from: '"RockyTracker" <no‑reply@rockytracker.com>',
        to,
        subject: '🎉 Welcome to RockyTracker newsletter!',
        html: `
      <h1>Hi there!</h1>
      <p>Thanks for signing up for our updates.</p>
      <p>— RockyTracker official</p>
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