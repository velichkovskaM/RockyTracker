require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('✅ Connected. Creating table...');
        return client.query(`
            CREATE TABLE IF NOT EXISTS message_log (
                                                        id SERIAL PRIMARY KEY,
                                                        device_id INTEGER REFERENCES device_list(id) ON DELETE SET NULL,
                                                        device_name VARCHAR(155) NOT NULL,
                                                        dev_eui VARCHAR(50) NOT NULL,
                                                        message_json JSONB NOT NULL,
                                                        size SMALLINT NOT NULL,
                                                        lat DECIMAL(11, 9) NOT NULL,
                                                        lng DECIMAL(12, 9) NOT NULL,
                                                        altitude DECIMAL(10, 2) NOT NULL,
                                                        device_timestamp TIMESTAMPTZ NOT NULL,
                                                        eu_device_timestamp timestamp,
                                                        received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        `);
    })
    .then(() => {
        console.log('✅ Table created.');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Failed:', err);
        client.end();
    });
