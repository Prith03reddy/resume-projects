/**
 * Database Connection Module
 * Supports XAMPP MySQL / MariaDB (default) and PostgreSQL with PostGIS.
 * Exposes a unified query(text, params) interface across database dialects.
 */

require('dotenv').config();

const isMysql = (process.env.DB_DRIVER || 'mysql').toLowerCase() === 'mysql';

let pool;
let query;
let getClient;

if (isMysql) {
  // =========================================================================
  // XAMPP Server MySQL / MariaDB Connection Pool (mysql2)
  // =========================================================================
  const mysql = require('mysql2/promise');

  const mysqlConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'auratriage',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    decimalNumbers: true,
  };

  pool = mysql.createPool(mysqlConfig);

  /**
   * Helper that translates PostgreSQL placeholder syntax ($1, $2, ...) to MySQL (?)
   */
  function formatMysqlQuery(text) {
    return text.replace(/\$\d+/g, '?');
  }

  /**
   * Unified query executor for MySQL
   */
  query = async function (text, params = []) {
    const start = Date.now();
    try {
      const formattedSql = formatMysqlQuery(text);
      const [rows, fields] = await pool.query(formattedSql, params);
      const duration = Date.now() - start;

      if (process.env.NODE_ENV === 'development' && duration > 50) {
        console.log(`[MySQL Executed] ${duration}ms | rows: ${Array.isArray(rows) ? rows.length : rows?.affectedRows}`);
      }

      return {
        rows: Array.isArray(rows) ? rows : [],
        rowCount: Array.isArray(rows) ? rows.length : (rows?.affectedRows || 0),
        raw: rows,
      };
    } catch (err) {
      console.error(`[MySQL Error] Query failed: "${text.substring(0, 100)}..."`, err.message);
      throw err;
    }
  };

  getClient = async function () {
    const connection = await pool.getConnection();
    return {
      query: (sql, params) => query(sql, params),
      release: () => connection.release(),
    };
  };

  async function testConnection(retries = 3, delayMs = 1500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const [rows] = await pool.query('SELECT VERSION() AS version, CURRENT_TIMESTAMP AS server_time;');
        console.log(`[XAMPP MySQL] Connected successfully to "${mysqlConfig.database}" on port ${mysqlConfig.port}.`);
        console.log(`[XAMPP MySQL] Server Version: ${rows[0].version} | Time: ${rows[0].server_time}`);
        return true;
      } catch (err) {
        console.warn(`[XAMPP MySQL] Connection attempt ${attempt}/${retries} failed: ${err.message}`);
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }
    console.error('[XAMPP MySQL] Could not connect to XAMPP MySQL. Ensure Apache and MySQL are started in XAMPP Control Panel.');
    return false;
  }

  testConnection();

} else {
  // =========================================================================
  // PostgreSQL 16 + PostGIS 3.4 Connection Pool (pg)
  // =========================================================================
  const { Pool } = require('pg');

  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/auratriage',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('[PostgreSQL Pool Error] Unexpected idle client error:', err.message);
  });

  query = async function (text, params = []) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development' && duration > 50) {
        console.log(`[SQL Executed] ${duration}ms | rows: ${res.rowCount}`);
      }
      return res;
    } catch (err) {
      console.error(`[SQL Error] Query failed: "${text.substring(0, 100)}..."`, err.message);
      throw err;
    }
  };

  getClient = async function () {
    return await pool.connect();
  };

  async function testConnection(retries = 3, delayMs = 1500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW() AS server_time, postgis_version() AS postgis_ver;');
        client.release();
        console.log(`[PostgreSQL] Connected successfully.`);
        console.log(`[PostGIS] Version: ${res.rows[0].postgis_ver} | Time: ${res.rows[0].server_time}`);
        return true;
      } catch (err) {
        console.warn(`[PostgreSQL] Connection attempt ${attempt}/${retries} failed: ${err.message}`);
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }
    return false;
  }

  testConnection();
}

module.exports = {
  pool,
  query,
  getClient,
  isMysql,
  isPostgres: !isMysql,
};
