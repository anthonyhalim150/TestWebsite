const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool
const pool = mysql.createPool({
    host: '34.67.118.54'||process.env.DB_HOST,
    user: 'root'||process.env.DB_USER,
    password: 'Vvs319338'||process.env.DB_PASSWORD,
    database: 'ecommerce'||process.env.DB_NAME,
    port: '3306'||process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool;
