const fs = require('fs');
const path = require('path');
const { pool, initializeSchema, initVector } = require('./src/db');
const { generateEmbedding } = require('./src/utils/embeddings');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Ensure schema is initialized
    await initializeSchema();
    await initVector();

    // Load legal.json
    const legalDataPath = path.join(__dirname, 'data', 'legal.json');
    if (!fs.existsSync(legalDataPath)) {
      console.log('⚠️ legal.json not found, skipping seeding');
      return;
    }

    const legalData = JSON.parse(fs.readFileSync(legalDataPath, 'utf8'));
    console.log(`📄 Found ${legalData.length} items in legal.json`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Clear existing data (optional, but good for a fresh start in a demo)
      // await client.query('DELETE FROM documents WHERE metadata->>\'source\' = \'legal.json\'');

      for (let i = 0; i < legalData.length; i++) {
        const item = legalData[i];
        console.log(` processing: ${item.title}`);
        
        const embedding = await generateEmbedding(item.content);
        
        const metadata = {
          title: item.title,
          source: 'legal.json',
          type: 'legal_item',
          extractedAt: new Date().toISOString()
        };

        await client.query(
          'INSERT INTO documents (content, embedding, metadata) VALUES ($1, $2, $3)',
          [item.content, JSON.stringify(embedding), JSON.stringify(metadata)]
        );
      }

      await client.query('COMMIT');
      console.log('✅ Database seeded successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seedDatabase();
