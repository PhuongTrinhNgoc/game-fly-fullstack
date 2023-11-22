const Pool = require('pg').Pool
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool({
    user: 'postgres',
    host: process.env.HOST,
    port: process.env.DBPORT,
    password: process.env.PASSWORD,
    database: "postgres"
});
module.exports = pool
