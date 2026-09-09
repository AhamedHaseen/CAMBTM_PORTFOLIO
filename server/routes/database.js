import express from 'express';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, getEngine } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const { Pool } = pg;
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(requireAuth);

const TABLES = [
  'users',
  'portfolio_projects',
  'portfolio_sections',
  'creatives',
  'videos',
  'brands',
  'media',
  'hero_bento',
  'audit_logs',
  'login_logs',
  'sessions',
  'settings'
];

/**
 * GET /api/database/export
 * Download full database snapshot in JSON or SQL format
 */
router.get('/export', async (req, res) => {
  const format = (req.query.format || 'json').toLowerCase();

  try {
    const dbDump = {
      exported_at: new Date().toISOString(),
      engine: getEngine(),
      version: '1.0.0',
      tables: {}
    };

    for (const table of TABLES) {
      try {
        const result = await query(`SELECT * FROM ${table} ORDER BY id ASC`);
        // Mask passwords in export
        const rows = (result.rows || []).map(row => {
          if (row.password_hash) {
            return { ...row, password_hash: '[PROTECTED_HASH]' };
          }
          if (row.two_factor_secret) {
            return { ...row, two_factor_secret: '[ENCRYPTED_SECRET]' };
          }
          return row;
        });
        dbDump.tables[table] = rows;
      } catch (tableErr) {
        dbDump.tables[table] = [];
      }
    }

    await recordAudit(req, {
      action: 'EXPORT_DATABASE',
      module: 'Database',
      description: `Admin exported full database snapshot (${format.toUpperCase()} format)`
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'sql') {
      let sqlContent = `-- Cambridge Marketing CMS Database Snapshot\n-- Generated At: ${new Date().toISOString()}\n\n`;
      for (const [table, rows] of Object.entries(dbDump.tables)) {
        if (!rows || rows.length === 0) continue;
        sqlContent += `-- Table: ${table}\n`;
        for (const row of rows) {
          const keys = Object.keys(row);
          const values = keys.map(k => {
            const val = row[k];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          sqlContent += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlContent += '\n';
      }

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="cambm_db_export_${timestamp}.sql"`);
      return res.send(sqlContent);
    }

    // Default JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="cambm_db_export_${timestamp}.json"`);
    return res.send(JSON.stringify(dbDump, null, 2));
  } catch (err) {
    console.error('Database export error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/database/backup
 * Download full comprehensive backup file package
 */
router.get('/backup', async (req, res) => {
  try {
    const backupData = {
      backup_id: `backup_${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: req.user.email,
      engine: getEngine(),
      tables_count: TABLES.length,
      data: {}
    };

    for (const table of TABLES) {
      try {
        const result = await query(`SELECT * FROM ${table}`);
        backupData.data[table] = result.rows || [];
      } catch (err) {
        backupData.data[table] = [];
      }
    }

    await recordAudit(req, {
      action: 'CREATE_BACKUP',
      module: 'Database',
      description: `Created & downloaded comprehensive database backup archive (${backupData.backup_id})`
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="cambm_full_backup_${timestamp}.cambmbak"`);
    return res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    console.error('Backup error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/database/test-connection
 * Test an arbitrary PostgreSQL / Supabase connection URI
 */
router.post('/test-connection', async (req, res) => {
  const { connectionUri } = req.body;

  if (!connectionUri || !connectionUri.startsWith('postgres')) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid PostgreSQL connection URI starting with postgresql:// or postgres://'
    });
  }

  let testPool;
  try {
    testPool = new Pool({
      connectionString: connectionUri.trim(),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });

    const result = await testPool.query('SELECT NOW() as server_time, version() as version');
    await testPool.end();

    return res.json({
      success: true,
      message: 'Connection successful! Remote database responded.',
      serverTime: result.rows[0]?.server_time,
      version: result.rows[0]?.version?.split(' on ')[0] || 'PostgreSQL'
    });
  } catch (err) {
    if (testPool) {
      try { await testPool.end(); } catch (e) {}
    }
    return res.status(400).json({
      success: false,
      error: `Database connection failed: ${err.message}`
    });
  }
});

/**
 * POST /api/database/update-connection
 * Save new database connection URI into .env file safely
 */
router.post('/update-connection', async (req, res) => {
  const { connectionUri } = req.body;

  if (!connectionUri || !connectionUri.startsWith('postgres')) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid PostgreSQL URI.'
    });
  }

  // Validate the connection first
  let testPool;
  try {
    testPool = new Pool({
      connectionString: connectionUri.trim(),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });
    await testPool.query('SELECT 1');
    await testPool.end();
  } catch (err) {
    if (testPool) try { await testPool.end(); } catch (e) {}
    return res.status(400).json({
      success: false,
      error: `Could not connect with provided URI: ${err.message}`
    });
  }

  try {
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${connectionUri.trim()}"`);
    } else {
      envContent += `\nDATABASE_URL="${connectionUri.trim()}"\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    process.env.DATABASE_URL = connectionUri.trim();

    await recordAudit(req, {
      action: 'UPDATE_DB_CONNECTION',
      module: 'Database',
      description: 'Admin updated database connection string / target server URI'
    });

    return res.json({
      success: true,
      message: 'Database connection URI updated and verified successfully! Server environment updated.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
