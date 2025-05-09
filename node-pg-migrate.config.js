require('dotenv').config();

module.exports = {
    migrationsTable: 'pgmigrations',
    dir: 'migrations',
    databaseUrl: process.env.DATABASE_URL
};
