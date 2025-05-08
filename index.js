
// Email content parser function
const express    = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
//const sqlite3    = require('sqlite3').verbose();
const path       = require('path');

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/update/:id', (req, res) => {
    const { id } = req.params;
    res.send(`Great record ${id} have been updated.`)
})

// Setting up local host distribution
/*const db = new sqlite3.Database('./subs.db');
db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     email TEXT UNIQUE NOT NULL,
                                                     subscribed DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
*/

// Temp email password for app type RockyTracker
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'rockytrackerofficial@gmail.com',
        pass: 'vuim hvvk yivk lnyr'
    }
    // If gmail account needed, same user as email, password Bestgroupever!
});

// Change here for context of email, can add images, hyperlinks, whataver is needed :)
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

// Notifications for successful/unsuccessful subscriptions, can be edited to show up as pop ups if needed
app.post('/api/subscribe', (req, res) => {
    const { email, consent } = req.body;
    if (!email || !consent) {
        return res.status(400).send('Email + consent required');
    }

    /*const stmt = db.prepare(
        `INSERT OR IGNORE INTO subscriptions(email) VALUES(?)`
    );
    stmt.run(email, async err => {
        if (err) return res.status(500).send('DB error');
        try {
            await sendWelcomeEmail(email);
            res.send('Subscribed! Welcome email sent.');
        } catch (e) {
            console.error(e);
            res.send('Subscribed, but failed to send welcome email.');
        }
    });*/
});

// Local host 3000
app.listen(3000, () =>
    console.log('Server listening on http://localhost:3000')
);
