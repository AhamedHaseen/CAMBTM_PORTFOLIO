-- Cambridge Marketing (CAMBM) PostgreSQL Database Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) DEFAULT 'CAMBM Admin',
  role VARCHAR(50) DEFAULT 'admin',
  avatar VARCHAR(500) DEFAULT '',
  failed_attempts INT DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Portfolio Projects Table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  brand VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  year VARCHAR(20) DEFAULT '2026',
  status VARCHAR(50) DEFAULT 'published',
  short_description TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  featured_image TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  services TEXT DEFAULT '["branding","social","campaigns"]',
  industry VARCHAR(100) DEFAULT 'general',
  market VARCHAR(100) DEFAULT 'global',
  metrics TEXT DEFAULT '["+140% Growth","3.2x ROI","500k+ Reach"]',
  display_order INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Portfolio Case Study Sections Table
CREATE TABLE IF NOT EXISTS portfolio_sections (
  id SERIAL PRIMARY KEY,
  project_id VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Creatives Table
CREATE TABLE IF NOT EXISTS creatives (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Branding',
  placements TEXT DEFAULT '["Homepage","Portfolio"]',
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Videos & Hero Management Table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  video_url TEXT NOT NULL,
  video_type VARCHAR(50) DEFAULT 'html5',
  poster_url TEXT DEFAULT '',
  is_hero BOOLEAN DEFAULT FALSE,
  autoplay BOOLEAN DEFAULT TRUE,
  loop BOOLEAN DEFAULT TRUE,
  muted BOOLEAN DEFAULT TRUE,
  controls BOOLEAN DEFAULT FALSE,
  placements TEXT DEFAULT '["Homepage Hero"]',
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'published',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Media Assets Table
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type VARCHAR(100) DEFAULT '',
  file_type VARCHAR(50) DEFAULT 'image',
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user VARCHAR(255) DEFAULT 'Admin',
  action VARCHAR(50) NOT NULL,
  module VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) DEFAULT '',
  description TEXT DEFAULT '',
  details TEXT DEFAULT '{}',
  ip_address VARCHAR(100) DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Login History Logs Table
CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  admin_user VARCHAR(255) DEFAULT 'Admin',
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(100) DEFAULT '',
  device VARCHAR(100) DEFAULT 'Desktop',
  browser VARCHAR(100) DEFAULT 'Browser',
  status VARCHAR(50) NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP WITH TIME ZONE NULL
);

-- 10. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Website & System Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio_projects(status, is_deleted);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_sections_project ON portfolio_sections(project_id);
CREATE INDEX IF NOT EXISTS idx_creatives_published ON creatives(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, is_hero);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status, is_deleted);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module, action);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email, login_time);
