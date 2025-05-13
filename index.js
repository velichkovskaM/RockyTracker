require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { types } = require('pg');
const pool = require('./db');

const subscriptionRoutes = require('./js/subscriptionRoutes');
const unsubscriptionRoutes = require('./js/unsubscriptionRoutes');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(subscriptionRoutes);
app.use(unsubscriptionRoutes);

types.setTypeParser(20, val => parseInt(val));
types.setTypeParser(23, val => parseInt(val));

let lastDataMessage = "";


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/get-data', async (req, res) => {
    try {
        const result = await pool.query(`
            WITH latest_logs AS (
                SELECT DISTINCT ON (m.device_id)
                    m.device_id,
                    m.message_json,
                    m.size,
                    m.device_timestamp,
                    m.received_at,
                    COUNT(*) OVER (PARTITION BY m.device_id) AS accident_occurrences
                FROM message_log m
                ORDER BY m.device_id, m.received_at DESC
            )
            SELECT
                d.device_name,
                d.lat,
                d.lng,
                d.type,
                COALESCE(l.size, -1) AS size,
                l.message_json AS message_json,
                l.device_timestamp AS device_timestamp,
                l.received_at AS received_at,
                COALESCE(l.accident_occurrences, 0) AS accident_occurrences
            FROM device_list d
                     LEFT JOIN latest_logs l ON l.device_id = d.id;
        `);

        res.json(result.rows.map(row => ({
            device_name: row.device_name,
            message_json: row.message_json || {},
            type: row.type,
            size: Number(row.size),
            lat: row.lat,
            lng: row.lng,
            device_timestamp: row.device_timestamp ? new Date(row.device_timestamp).toISOString() : 'N/A',
            received_at: row.received_at ? new Date(row.received_at).toISOString() : 'N/A',
            accident_occurrences: Number(row.accident_occurrences)
        })));

    } catch (err) {
        console.error('Failed to fetch data:', err.message);
        res.status(500).send('Database error:\n' + err.message);
    }
});


app.get('/update/upcoming', (req, res) => {
    res.send(lastDataMessage);
});

app.post('/update/upcoming', async (req, res) => {
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
        // Try to find the device ID (but don't insert)
        const deviceLookup = await pool.query(
            `SELECT id FROM device_list WHERE device_name = $1`,
            [deviceName]
        );

        const deviceId = deviceLookup.rows[0]?.id ?? null;

        // Insert message with or without deviceId
        await pool.query(
            `INSERT INTO message_log (
                device_id, device_name, message_json, type, size, lat, lng, device_timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                deviceId,
                deviceName,
                JSON.stringify(jsonMessage),
                type,
                size,
                lat,
                lng,
                time
            ]
        );

        lastDataMessage = data;
        res.send('Message logged successfully');
    } catch (err) {
        console.error('DB insert error:', err);
        res.status(500).send('Database error:\n' + err.message);
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


const PORT = process.env.PORT || 2900;
app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
);

// const typeLabels = {
//     0: "street",
//     1: "railroad"
// };
//
// const sizeLabels = {
//     0: "small",
//     1: "big"
// };

//const rawMessage = "id:456,type:0,size:1";
//const data = parseMessageString(rawMessage);

//const readableType = typeLabels[data.type] ?? "unknown";
//const readableSize = sizeLabels[data.size] ?? "unknown";

//console.log(rawMessage)
//console.log(`The Arduino with ID of: ${data.id}, located on a: ${readableType} is of size: ${readableSize}.`);