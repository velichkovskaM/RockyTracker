const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const {json} = require("express");

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lastReceivedMessage.json');


const router = express.Router();

let lastJson = ""

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_CODE,
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
    const jsonMessage = req.body;
    const deviceName  = req.body.end_device_ids?.device_id;
    const dataString  = req.body.uplink_message?.decoded_payload?.data;
    const metadata    = req.body.uplink_message?.rx_metadata;


    if (!deviceName || !jsonMessage || !dataString || !metadata) {
        return res.status(400).send('Missing required fields');
    }


    let dataArray;
    try {
        dataArray = parseMessageString(dataString);
    } catch (err) {
        console.error('Parse error:', err);
        return res.status(400).send('Invalid data string format');
    }

    const { id, size } = dataArray;
    const type = 0;
    const firstHop = metadata[0];
    const { latitude: lat, longitude: lng } = firstHop.location;

    const rawTime = req.body.received_at || firstHop.time || new Date().toISOString();
    const time = new Date(rawTime);

    if (
        id   == null ||
        size == null ||
        lat  == null ||
        lng  == null ||
        !time
    ) {
        return res.status(400).send('Missing parsed or metadata fields');
    }

    try {
        const defaultType = 0;

        await pool.query(
            `INSERT INTO device_list (id, device_name, lat, lng, type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO NOTHING`,
            [id, deviceName, lat, lng, defaultType]
        );


        await pool.query(
            `INSERT INTO message_log (
                device_id,
                device_name,
                message_json,
                size,
                type,
                lat,
                lng,
                device_timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, deviceName, JSON.stringify(jsonMessage), size, defaultType, lat, lng, time]
        );

        lastJson = jsonMessage;
        fs.writeFileSync(path.join(__dirname, 'lastReceivedMessage.json'), JSON.stringify(lastJson, null, 2));

        const result = await pool.query(`SELECT email FROM subscription_list`);
        const emails = result.rows.map(row => row.email);

        const subject = `🪨RockyTracker Alert: Update from ${deviceName}`;
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New RockyTracker Alert</title>
          <style>
            body {
              background-color: #F6F6F6;
              margin: 0;
              padding: 0;
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            }
            .main-table {
              max-width: 600px;
              margin: 30px auto;
              background: #fff;
            }
            .content-cell {
              padding: 30px 30px;
            }
            h1 {
              font-size: 22px;
              color: #333;
              text-align: center;
              margin: 0 0 25px 0;
              font-weight: normal;
            }
            .divider {
              border-bottom: 1px solid #ccc;
              margin: 20px 0;
            }
            p {
              color: #333;
              font-size: 14px;
              line-height: 1.6;
              text-align: left;
              padding: 0 60px;
              margin:0;
            }
            .space {
              line-height: 0.5;
              text-align: center;
            }
            .team {
              font-weight: bold;
            }
            .footer {
              color: #666;
              font-size: 12px;
              margin-top: 20px;
              text-align: center;
            }
            a.unsubscribe {
              color: #666;
              text-decoration: underline;
            }
            @media only screen and (max-width: 600px) {
              .main-table, .content-cell {
                width: 100% !important;
                padding: 10px !important;
              }
              h1 {
                font-size: 20px !important;
              }
              p {
                font-size: 13px !important;
              }
            }
          </style>
        </head>
        <body>
          <table class="main-table" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="content-cell">
                <h1>⚠️New RockyTracker Alert⚠️</h1>
                <div class="divider"></div>
                <div class="space"><br><br><br><br></div>
                <p>New active rockfall has been reported:</p>
                <div class="space"><br><br></div>
                <p><strong>Device:</strong> ${deviceName}</p>
                <p><strong>Type:</strong> ${type === 0 ? 'Road' : 'Railroad'}</p>
                <p><strong>Location:</strong> ${lat}, ${lng}</p>
                <p><strong>Time:</strong> ${new Date(time).toLocaleString()}</p>
                <div class="space"><br><br><br><br></div>
                <p> View on <a href="https://rockytracker.onrender.com" style="text-decoration:underline;color:#333333">RockyTracker map</a></p>
                <div class="space"><br><br><br><br></div>
                <p style="text-align: right">Stay safe out there,</p>
                <p class="team" style="text-align: right">🪨The RockyTracker Team</p>
                <div class="divider"></div>
                <div class="footer">
                  If you didn’t sign up for these alerts, feel free to ignore this email or
                  <a class="unsubscribe" href="${unsubscribeUrl}" target="_blank">unsubscribe</a>.
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>

        `;

        for (const email of emails) {
            const unsubscribeUrl = `https://rockytracker.onrender.com/unsubscribe?email=${encodeURIComponent(email)}`;

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

router.get('/update/upcoming', (req, res) => {
    try {
        const savedJson = fs.readFileSync(filePath, 'utf8');
        res.type('application/json').send(savedJson);
    } catch (err) {
        res.status(404).send({ error: 'No last message stored yet.' });
    }
});

module.exports = router;