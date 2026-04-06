const { Pool } = require('pg');
const { registerType } = require('pgvector/pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolOptions = {
  connectionString: process.env.NEON_DATABASE_URL,
};

// Neon requires SSL. If not specified in the URL, we provide a default
if (!process.env.NEON_DATABASE_URL.includes("sslmode=")) {
  poolOptions.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolOptions);

/**
 * Initialize the database schema
 */
async function initializeSchema() {
  const client = await pool.connect();
  try {
    console.log('🚀 Initializing database schema...');
    
    // Check if the vector extension is already enabled
    const extensionCheck = await client.query(
      "SELECT 1 FROM pg_extension WHERE extname = 'vector'"
    );
    
    if (extensionCheck.rowCount === 0) {
      console.log('📦 Enabling pgvector extension...');
      await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    }

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schemaSql);
    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Helper to register vector type for the pool
 */
async function initVector() {
  const client = await pool.connect();
  try {
    await registerType(client);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initializeSchema,
  initVector,
  query: (text, params) => pool.query(text, params),
};
