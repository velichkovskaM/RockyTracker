require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

let lastDataMessage = "";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
);