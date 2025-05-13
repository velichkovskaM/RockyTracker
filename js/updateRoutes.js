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

function parseMessageString(str) {
    const parts = str.split(',');
    const parsed = {};

    for (const part of parts) {
        const [key, value] = part.split('=').map(s => s.trim());
        parsed[key] = isNaN(value) ? value : Number(value);
    }

    return parsed;
}

router.post('/update/upcoming', async (req, res) => {
    console.log("Begun!")
    const jsonMessage = req.body;
    const deviceName = req.body.end_device_ids?.deviceId;
    const data = req.body.uplink_message?.decoded_payload?.data;

    if (!deviceName || !jsonMessage || !data) {
        return res.status(400).send('Missing required fields');
    }

    let dataArray;
    try {
        dataArray = parseMessageString(data);
    } catch (err) {
        console.error('Parse error:', err);
        return res.status(400).send('Invalid data string format');
    }

    const { type, size, lat, lng, time } = dataArray;

    if (
        type == null || size == null ||
        lat == null || lng == null || !time
    ) {
        return res.status(400).send('Missing parsed message fields');
    }

    try {
        const deviceLookup = await pool.query(
            `SELECT id FROM device_list WHERE device_name = $1`,
            [deviceName]
        );

        const deviceId = deviceLookup.rows[0]?.id ?? null;

        await pool.query(
            `INSERT INTO message_log (
                device_id, device_name, message_json, type, size, lat, lng, device_timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [deviceId, deviceName, JSON.stringify(jsonMessage), type, size, lat, lng, time]
        );

        lastDataMessage = data;

        const result = await pool.query(`SELECT email FROM subscription_list`);
        const emails = result.rows.map(row => row.email);

        const subject = `🪨 RockyTracker Alert: Update from ${deviceName}`;
        const html = `
            <p><strong>New rockfall activity has been reported!</strong></p>
            <ul>
                <li><strong>Device:</strong> ${deviceName}</li>
                <li><strong>Type:</strong> ${type === 0 ? 'Street' : 'Railroad'}</li>
                <li><strong>Size:</strong> ${['Small', 'Big', 'Massive'][size]}</li>
                <li><strong>Location:</strong> ${lat}, ${lng}</li>
                <li><strong>Time:</strong> ${new Date(time).toLocaleString()}</li>
            </ul>
            <p><a href="https://rockytracker.onrender.com">View on RockyTracker map</a></p>
        `;

        for (const email of emails) {
            try {
                await transporter.sendMail({
                    to: email,
                    from: '"RockyTracker" <no-reply@rockytracker.com>',
                    subject: subject,
                    html: html
                });
            } catch (err) {
                console.error(`Failed to send alert to ${email}:`, err.message);
            }
        }

        res.send('Message logged and alerts sent');
    } catch (err) {
        console.error('DB insert error:', err);
        res.status(500).send('Database error:\n' + err.message);
    }
});

module.exports = router;