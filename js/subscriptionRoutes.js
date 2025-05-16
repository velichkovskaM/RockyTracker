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
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_CODE,
    }
});

async function sendWelcomeEmail(to) {
    const unsubscribeUrl = `https://rockytracker.onrender.com/unsubscribe?email=${encodeURIComponent(to)}`;

    await transporter.sendMail({
        from: '"RockyTracker" <no-reply@rockytracker.com>',
        to,
        subject: '🪨Welcome to RockyTracker!',
        html: `
     <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to RockyTracker</title>
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
          text-align: center;
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
            <h1>🎉 Welcome to RockyTracker!</h1>
            <div class="divider"></div>
            <div class="space"><br></div>
            <p><strong>Thank you for signing up!</strong></p>
            <div class="space"><br><br><br><br></div>
            <p>You will now receive instant alerts whenever a rockfall is detected on roads or railways across Slovenia.</p>
            <p>These notifications are here to help you stay safe and make smarter travel decisions.</p>
            <p>Whether you're commuting or planning a road trip, we’ve got you covered.</p>
            <div class="space"><br><br><br><br><br></div>
            <p>Stay safe out there,</p>
            <p class="team">🪨The RockyTracker Team</p>
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

