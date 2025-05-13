require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { types } = require('pg');
const pool = require('./db');

const subscriptionRoutes = require('./js/subscriptionRoutes');
const unsubscriptionRoutes = require('./js/unsubscriptionRoutes');
const updateRoutes = require('./js/updateRoutes')

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(subscriptionRoutes);
app.use(unsubscriptionRoutes);
app.use(updateRoutes)

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

const PORT = process.env.PORT || 2900;
app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
);