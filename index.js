require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

let lastDataMessage = "";

// 📦 Use Pool for efficient DB reuse
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 📧 Email transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'rockytrackerofficial@gmail.com',
        pass: 'vuim hvvk yivk lnyr'
    }
});

// 📧 Send welcome email
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

// 🌐 Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/update/upcoming', (req, res) => {
    res.send(lastDataMessage);
});

app.post('/update/upcoming', (req, res) => {
    console.log(req.body);
    lastDataMessage = req.body.uplink_message?.decoded_payload?.data || '';
    res.send('hello post');
});

app.post('/api/subscribe', async (req, res) => {
    const { email, consent } = req.body;
    if (!email || !consent) {
        return res.status(400).send('Email + consent required');
    }

    try {
        await pool.query(
            `INSERT INTO subscription_list(email)
       VALUES ($1)
       ON CONFLICT (email) DO NOTHING`,
            [email]
        );

        try {
            await sendWelcomeEmail(email);
            res.send('Subscribed! Welcome email sent.');
        } catch (e) {
            console.error(e);
            res.send('Subscribed, but failed to send welcome email.');
        }

    } catch (err) {
        console.error('DB error:', err);
        res.status(500).send('DB error');
    }
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
);



// require('dotenv').config();
// const { Client } = require('pg');
//
//
// // Email content parser function
// const express    = require('express');
// const bodyParser = require('body-parser');
// const nodemailer = require('nodemailer');
// const path       = require('path');
//
// let lastDataMessage = ""
//
// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });
//
// client.connect()
//     .then(() => {
//         console.log("Connected to the database")
//         return client.query(`
//       CREATE TABLE IF NOT EXISTS subscriptions (
//         id SERIAL PRIMARY KEY,
//         email TEXT UNIQUE NOT NULL,
//         subscribed TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
//       );
//     `);
//     })
//     .then(() => {
//         console.log('Table created or already exists.');
//         return client.end();
//     })
//     .catch(err => {
//         console.error('Error creating table:', err);
//         client.end();
//     });
//
//
// const app = express();
// app.use(bodyParser.json());
//
// app.use(express.static(path.join(__dirname)));
//
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });
//
// app.get('/update/upcoming', (req, res) => {
//     //delete require.cache[require.resolve('./lastmessage.json')];
//     //const slides = require('./lastmessage.json');
//     //const json = res.json(slides);
//     //res.send(json[0].data)
//     res.send(lastDataMessage)
// })
//
// app.post('/update/upcoming', (req, res) => {
//     console.log(req.body)
//     lastDataMessage = req.body.uplink_message.decoded_payload.data
//     res.send('hello post')
// })
//
// app.post('/update', (req, res) => {
//     console.log(res.json)
// })
//
// // Temp email password for app type RockyTracker
// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     auth: {
//         user: 'rockytrackerofficial@gmail.com',
//         pass: 'vuim hvvk yivk lnyr'
//     }
//     // If gmail account needed, same user as email, password Bestgroupever!
// });
//
// // Change here for context of email, can add images, hyperlinks, whataver is needed :)
// async function sendWelcomeEmail(to) {
//     await transporter.sendMail({
//         from: '"RockyTracker" <no‑reply@rockytracker.com>',
//         to,
//         subject: '🎉 Welcome to RockyTracker newsletter!',
//         html: `
//       <h1>Hi there!</h1>
//       <p>Thanks for signing up for our updates.</p>
//       <p>— RockyTracker official</p>
//     `
//     });
// }
//
// // Notifications for successful/unsuccessful subscriptions, can be edited to show up as pop ups if needed
// const { Client } = require('pg');
// const express = require('express');
// const bodyParser = require('body-parser');
// const app = express();
//
// app.use(bodyParser.json());
//
// app.post('/api/subscribe', async (req, res) => {
//     const { email, consent } = req.body;
//     if (!email || !consent) {
//         return res.status(400).send('Email + consent required');
//     }
//
//     const client = new Client({
//         connectionString: process.env.DATABASE_URL,
//         ssl: { rejectUnauthorized: false }
//     });
//
//     try {
//         await client.connect();
//         const result = await client.query(
//             `INSERT INTO subscriptions(email)
//              VALUES($1)
//              ON CONFLICT (email) DO NOTHING`,
//             [email]
//         );
//
//         await client.end();
//
//         try {
//             await sendWelcomeEmail(email);
//             res.send('Subscribed! Welcome email sent.');
//         } catch (e) {
//             console.error(e);
//             res.send('Subscribed, but failed to send welcome email.');
//         }
//
//     } catch (err) {
//         console.error('DB error:', err);
//         res.status(500).send('DB error');
//     }
// });
//
//
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () =>
//     console.log(`Server listening on port ${PORT}`)
// );
