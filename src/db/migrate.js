const db = require('../config/database');
const logger = require('../utils/logger');

const createTables = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create posts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        post_id SERIAL PRIMARY KEY,
        author_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('Database tables created successfully');
  } catch (error) {
    logger.error('Error creating database tables:', error);
    throw error;
  }
};

const dropTables = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Dropping tables is only allowed in test environment');
  }

  try {
    await db.query('DROP TABLE IF EXISTS posts CASCADE');
    await db.query('DROP TABLE IF EXISTS users CASCADE');
    logger.info('Database tables dropped successfully');
  } catch (error) {
    logger.error('Error dropping database tables:', error);
    throw error;
  }
};

const migrate = async () => {
  if (process.env.NODE_ENV === 'test') {
    await dropTables();
  }
  await createTables();
};

// Run migrations if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      logger.info('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrate; 