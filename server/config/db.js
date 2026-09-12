import pg from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;
let pgPool = null;
let sqliteDb = null;
let activeEngine = 'none';

const databaseUrl = process.env.DATABASE_URL?.trim();

// Setup PostgreSQL (Supabase) if DATABASE_URL is provided
if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  try {
    const isSupabase = databaseUrl.includes('supabase.co') || databaseUrl.includes('pooler.supabase.com');
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: isSupabase ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    activeEngine = 'postgresql';
    console.log('✅ PostgreSQL (Supabase) connection pool configured.');
  } catch (err) {
    console.warn('⚠️ Failed to initialize PG Pool, falling back to SQLite:', err.message);
    pgPool = null;
  }
}

// Fallback SQLite instance for immediate zero-config local run
function getSqlite() {
  if (!sqliteDb) {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'cambm_local.db');
    sqliteDb = new sqlite3.Database(dbPath);
    sqliteDb.run('PRAGMA foreign_keys = ON');
    if (!pgPool) {
      activeEngine = 'sqlite';
    }
    console.log(`📁 Local SQLite database initialized at: ${dbPath}`);
  }
  return sqliteDb;
}

if (!pgPool) {
  getSqlite();
}

/**
 * Universal query runner: handles PostgreSQL ($1, $2) and SQLite (?)
 */
export async function query(sql, params = []) {
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      try {
        const res = await client.query(sql, params);
        return { rows: res.rows, rowCount: res.rowCount };
      } finally {
        client.release();
      }
    } catch (pgError) {
      console.error('PostgreSQL query failed, attempting SQLite fallback:', pgError.message);
      // If PG connection broke, fallback to SQLite
      return runSqliteQuery(sql, params);
    }
  } else {
    return runSqliteQuery(sql, params);
  }
}

function runSqliteQuery(sql, params = []) {
  const db = getSqlite();
  // Translate PostgreSQL $1, $2 placeholders to SQLite ?
  let sqliteSql = sql.replace(/\$(\d+)/g, '?');

  // Translate PostgreSQL JSONB / TIMESTAMP WITH TIME ZONE / types for SQLite compatibility
  sqliteSql = sqliteSql
    .replace(/JSONB/gi, 'TEXT')
    .replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME')
    .replace(/BOOLEAN/gi, 'INTEGER')
    .replace(/SERIAL PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/TRUE/g, '1')
    .replace(/FALSE/g, '0');

  return new Promise((resolve, reject) => {
    const trimmed = sqliteSql.trim();
    const isSelect = trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA');

    // Convert booleans and objects in params for SQLite
    const normalizedParams = params.map(p => {
      if (typeof p === 'boolean') return p ? 1 : 0;
      if (typeof p === 'object' && p !== null) return JSON.stringify(p);
      return p;
    });

    if (isSelect) {
      db.all(sqliteSql, normalizedParams, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
      });
    } else {
      db.run(sqliteSql, normalizedParams, function (err) {
        if (err) return reject(err);
        resolve({
          rows: [],
          rowCount: this.changes,
          insertId: this.lastID
        });
      });
    }
  });
}

export function getEngine() {
  if (pgPool) return 'postgresql';
  if (sqliteDb) return 'sqlite';
  return activeEngine;
}

export default {
  query,
  getEngine
};
