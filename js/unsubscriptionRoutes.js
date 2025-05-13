const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const path = require('path');
router.get('/unsubscribe', (req, res) => {
    res.sendFile(path.join(__dirname, '../unsubscribe.html'));
});

router.post('/api/unsubscribe', async (req, res) => {
    const {email} = req.body;

    if (!email) {
        return res.status(400).send('Email is required to unsubscribe.');
    }

    try {
        const result = await pool.query(
            'DELETE FROM subscription_list WHERE email = $1 RETURNING *',
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Email not found');
        }

        res.send('You have been unsubscribed.');
    } catch (err) {
        console.error('Unsubscribe error:', err);
        res.status(500).send('Server error');
    }
})

module.exports = router;