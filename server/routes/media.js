import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { recordAudit } from '../middleware/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

// Allowed MIME types: images, videos, audio, svg
const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'
];

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos and high-res assets
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, GIF, SVG, MP4, WEBM.`));
    }
  }
});

/**
 * GET /api/media
 * Fetch all uploaded media assets with search and type filters
 */
router.get('/', requireAuth, async (req, res) => {
  const { type, search } = req.query;
  try {
    let sql = 'SELECT * FROM media WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type && type !== 'all') {
      sql += ` AND file_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (search && search.trim() !== '') {
      sql += ` AND LOWER(original_name) LIKE $${paramIndex}`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return res.json({ success: true, media: result.rows || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/media/upload
 * Upload media file
 */
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  try {
    const file = req.file;
    const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const url = `/uploads/${file.filename}`;

    const insertRes = await query(`
      INSERT INTO media (original_name, filename, file_path, file_size, mime_type, file_type, url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [file.originalname, file.filename, file.path, file.size, file.mimetype, fileType, url]);

    await recordAudit(req, {
      action: 'UPLOAD',
      module: 'Media',
      description: `Admin uploaded media: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`
    });

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      media: {
        original_name: file.originalname,
        filename: file.filename,
        url,
        file_size: file.size,
        mime_type: file.mimetype,
        file_type: fileType
      }
    });
  } catch (err) {
    console.error('Media upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/media/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM media WHERE id = $1', [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    const item = result.rows[0];

    // Remove file from disk if exists
    if (fs.existsSync(item.file_path)) {
      try {
        fs.unlinkSync(item.file_path);
      } catch (e) {
        console.warn('Could not remove file from disk:', e.message);
      }
    }

    await query('DELETE FROM media WHERE id = $1', [id]);

    await recordAudit(req, {
      action: 'DELETE',
      module: 'Media',
      recordId: String(id),
      description: `Admin deleted media asset: ${item.original_name}`
    });

    return res.json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
