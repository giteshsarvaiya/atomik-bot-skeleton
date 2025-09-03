import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

/**
 * Initialize database connection and run migrations
 */
async function initializeDatabase() {
  try {
    // Ensure db directory exists
    const dbDir = path.join(__dirname);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database connection
    db = await open({
      filename: path.join(__dirname, 'bot.db'),
      driver: sqlite3.Database
    });

    console.log('✅ Database connection established');

    // Run migrations
    await runMigrations();

    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Run database migrations
 */
async function runMigrations() {
  try {
    const migrationsPath = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsPath, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`🔄 Running migration: ${file}`);
      await db.exec(migrationSQL);
      console.log(`✅ Migration completed: ${file}`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (db) {
    await db.close();
    console.log('✅ Database connection closed');
  }
}

export { initializeDatabase, getDatabase, closeDatabase };
