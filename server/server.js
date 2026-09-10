import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initializeDatabase } from './scripts/init-db.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import portfolioRoutes from './routes/portfolio.js';
import creativesRoutes from './routes/creatives.js';
import videosRoutes from './routes/videos.js';
import brandsRoutes from './routes/brands.js';
import mediaRoutes from './routes/media.js';
import auditRoutes from './routes/audit.js';
import loginLogsRoutes from './routes/loginLogs.js';
import settingsRoutes from './routes/settings.js';
import heroBentoRoutes from './routes/heroBento.js';
import usersRoutes from './routes/users.js';
import databaseRoutes from './routes/database.js';
import servicesRoutes from './routes/services.js';
import combosRoutes from './routes/combos.js';
import contactsRoutes from './routes/contacts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (HSTS, Anti-sniffing, XSS protection)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static Serving for Uploads & Media Assets
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/creatives', creativesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/login-history', loginLogsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/hero-bento', heroBentoRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/contacts', contactsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Cambridge Marketing API',
    time: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server and Initialize Database
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 CAMBM Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
  }
}

startServer();
