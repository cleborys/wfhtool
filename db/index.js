const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  query: (text, params, callback) => {
    pool.query(text, params, (error, result) => {
      console.log('Executed query', { text, rows: result.rowCount });
      callback(error, result);
    });
  },
}
