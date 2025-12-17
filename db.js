const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASS || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "",
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error(" DB CONNECT ERROR:", err.message);
  } else {
    console.log(" DB CONNECTED");
    conn.release();
  }
});

module.exports = pool;
