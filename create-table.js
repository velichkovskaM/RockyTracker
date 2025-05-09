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
      CREATE TABLE IF NOT EXISTS subscription_list (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
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
