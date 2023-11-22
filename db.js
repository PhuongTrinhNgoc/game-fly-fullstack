const Pool = require('pg').Pool
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool({
    user: 'postgres',
    host: 'db.mxiooupkzjtnbtnijazx.supabase.co',
    port: "5432",
    password: "Phuongxu0398!",
    database: "postgres"
});
module.exports = pool
