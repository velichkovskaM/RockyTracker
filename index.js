require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const subscriptionRoutes = require('./js/subscriptionRoutes');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(subscriptionRoutes);

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

function parseMessageString(str) {
    const parts = str.split(',');
    const parsed = {};

    for (const part of parts) {
        const [key, value] = part.split(':').map(s => s.trim());
        parsed[key] = isNaN(value) ? value : Number(value);
    }

    return parsed;
}

const typeLabels = {
    0: "street",
    1: "railroad"
};

const sizeLabels = {
    0: "small",
    1: "big"
};

const rawMessage = "id:456,type:0,size:1";
const data = parseMessageString(rawMessage);

const readableType = typeLabels[data.type] ?? "unknown";
const readableSize = sizeLabels[data.size] ?? "unknown";

console.log(`The Arduino with ID of: ${data.id}, located on a: ${readableType} is of size: ${readableSize}.`);