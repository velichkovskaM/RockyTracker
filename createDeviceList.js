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
            CREATE TABLE IF NOT EXISTS device_list (
                                                        id SERIAL PRIMARY KEY,
                                                        device_name VARCHAR(155) UNIQUE,
                                                        lat DECIMAL(11, 9) NOT NULL,
                                                        lng DECIMAL(12, 9) NOT NULL,
                                                        type SMALLINT NOT NULL,
                                                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
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
