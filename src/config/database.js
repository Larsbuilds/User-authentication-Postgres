const { Pool } = require('pg');
const logger = require('../utils/logger');

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  TEST_DB_NAME,
  NODE_ENV
} = process.env;

const config = {
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  database: NODE_ENV === 'test' ? TEST_DB_NAME : DB_NAME
};

const pool = new Pool(config);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    logger.error('Error connecting to the database:', err);
    process.exit(-1);
  } else {
    logger.info(`Connected to ${config.database} database successfully`);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 