require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { types } = require('pg');
const pool = require('./db');
const fs = require('fs');

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
                    m.type,
                    m.lat,
                    m.lng,
                    m.device_timestamp,
                    m.received_at,
                    m.eu_device_timestamp,
                    COUNT(*) FILTER (WHERE m.size <> 0) OVER (PARTITION BY m.device_id) AS filtered_accident_occurrences
                FROM message_log m
                ORDER BY m.device_id, m.received_at DESC
            )
            SELECT
                d.device_name,
                COALESCE(l.size, -1) AS size,
                l.message_json AS message_json,
                l.device_timestamp AS device_timestamp,
                l.received_at AS received_at,
                l.type,
                l.lat,
                l.lng,
                l.eu_device_timestamp,
                COALESCE(l.filtered_accident_occurrences, 0) AS accident_occurrences
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
            eu_timestamp: row.eu_device_timestamp ? new Date(row.eu_device_timestamp).toISOString() : 'N/A',
            received_at: row.received_at ? new Date(row.received_at).toISOString() : 'N/A',
            accident_occurrences: Number(row.accident_occurrences)
        })));

    } catch (err) {
        console.error('Failed to fetch data:', err.message);
        res.status(500).send('Database error:\n' + err.message);
    }
});

app.get("/video/:videoName", (req, res) => {
    const videoName = req.params.videoName;
    const videoPath = path.join(__dirname, "videos", videoName);

    if (!fs.existsSync(videoPath)) {
        return res.status(404).send("Video not found");
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            res
                .status(416)
                .send(
                    "Requested range not satisfiable\n" + start + " >= " + fileSize,
                );
            return;
        }

        const chunksize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

const PORT = process.env.PORT || 2900;
app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
);