const { pool } = require('./src/db');
require('dotenv').config();

async function clearDatabase() {
  try {
    console.log('⚠️ Clearing all documents from Neon database...');
    await pool.query('TRUNCATE TABLE documents RESTART IDENTITY');
    console.log('✅ Database cleared successfully.');
  } catch (err) {
    console.error('❌ Error clearing database:', err);
  } finally {
    await pool.end();
  }
}

clearDatabase();
