import bcrypt from 'bcryptjs';
import { query, getEngine } from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function ensureColumn(table, column, def) {
  try {
    if (getEngine() === 'postgresql') {
      await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${def}`);
    } else {
      const info = await query(`PRAGMA table_info(${table})`);
      const exists = (info.rows || []).some(r => r.name.toLowerCase() === column.toLowerCase());
      if (!exists) {
        await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
        console.log(`✅ Added missing column [${column}] to [${table}] in SQLite`);
      }
    }
  } catch (err) {
    // Ignore duplicate or existing column errors
  }
}

export async function initializeDatabase(options = {}) {
  const silent = options.silent ?? true;
  if (!silent) console.log(`🚀 Starting Database initialization using engine: [${getEngine()}]...`);

  try {
    // 1. Create Users
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) DEFAULT 'CAMBM Admin',
        role VARCHAR(50) DEFAULT 'admin',
        avatar VARCHAR(500) DEFAULT '',
        two_factor_secret VARCHAR(255) DEFAULT '',
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        recovery_codes TEXT DEFAULT '[]',
        permissions TEXT DEFAULT '["*"]',
        status VARCHAR(50) DEFAULT 'active',
        failed_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await ensureColumn('users', 'two_factor_secret', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('users', 'two_factor_enabled', "BOOLEAN DEFAULT FALSE");
    await ensureColumn('users', 'two_factor_method', "VARCHAR(50) DEFAULT 'email'");
    await ensureColumn('users', 'email_otp_code', "VARCHAR(20) DEFAULT ''");
    await ensureColumn('users', 'email_otp_expires_at', "TIMESTAMP NULL");
    await ensureColumn('users', 'recovery_codes', "TEXT DEFAULT '[]'");
    await ensureColumn('users', 'permissions', "TEXT DEFAULT '[\"*\"]'");
    await ensureColumn('users', 'status', "VARCHAR(50) DEFAULT 'active'");

    // 2. Create Portfolio Projects
    await query(`
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
        industry VARCHAR(100) DEFAULT 'Beauty & Wellness',
        market VARCHAR(100) DEFAULT 'Global',
        location VARCHAR(255) DEFAULT 'Colombo, Sri Lanka',
        challenge TEXT DEFAULT '',
        approach TEXT DEFAULT '',
        deliverables TEXT DEFAULT '',
        metrics TEXT DEFAULT '["+140% Growth","3.2x ROI","500k+ Reach"]',
        display_order INT DEFAULT 0,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migration: Add missing columns if upgrading an existing table
    await ensureColumn('portfolio_projects', 'location', "VARCHAR(255) DEFAULT 'Colombo, Sri Lanka'");
    await ensureColumn('portfolio_projects', 'challenge', "TEXT DEFAULT ''");
    await ensureColumn('portfolio_projects', 'approach', "TEXT DEFAULT ''");
    await ensureColumn('portfolio_projects', 'deliverables', "TEXT DEFAULT ''");
    await ensureColumn('portfolio_projects', 'industry', "VARCHAR(100) DEFAULT 'Beauty & Wellness'");
    await ensureColumn('portfolio_projects', 'market', "VARCHAR(100) DEFAULT 'Global'");
    await ensureColumn('portfolio_projects', 'metrics', "TEXT DEFAULT '[\"+140% Growth\",\"3.2x ROI\",\"500k+ Reach\"]'");
    await ensureColumn('portfolio_projects', 'services', "TEXT DEFAULT '[\"branding\",\"social\",\"campaigns\"]'");

    // 3. Create Portfolio Sections
    await query(`
      CREATE TABLE IF NOT EXISTS portfolio_sections (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(100) NOT NULL,
        section_key VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT DEFAULT '',
        is_enabled BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create Creatives
    await query(`
      CREATE TABLE IF NOT EXISTS creatives (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        image_url TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Branding',
        placements TEXT DEFAULT '["Homepage","Portfolio"]',
        display_order INT DEFAULT 0,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Create Videos
    await query(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Create Brands
    await query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        logo_url TEXT NOT NULL,
        website_url TEXT DEFAULT '',
        description TEXT DEFAULT '',
        display_order INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'published',
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Create Media
    await query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT DEFAULT 0,
        mime_type VARCHAR(100) DEFAULT '',
        file_type VARCHAR(50) DEFAULT 'image',
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Create Audit Logs
    await query(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Create Login History Logs
    await query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id SERIAL PRIMARY KEY,
        admin_user VARCHAR(255) DEFAULT 'Admin',
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(100) DEFAULT '',
        device VARCHAR(100) DEFAULT 'Desktop',
        browser VARCHAR(100) DEFAULT 'Browser',
        status VARCHAR(50) NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP NULL
      )
    `);

    // 10. Create Sessions
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 11. Create Settings
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Create Hero Bento (Hero Infinite Slider Media)
    await query(`
      CREATE TABLE IF NOT EXISTS hero_bento (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        media_type VARCHAR(50) NOT NULL DEFAULT 'image',
        media_url TEXT NOT NULL,
        poster_url TEXT DEFAULT '',
        column_index INT DEFAULT 1,
        display_order INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'published',
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (!silent) console.log('✅ Database tables checked / created.');

    // Seed default admin user
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'marketing@cambt.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@Cambm2026!';
    
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (!existingUser.rows || existingUser.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(adminPassword, salt);
      await query(`
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
      `, [adminEmail, hash, 'Cambridge Marketing Admin', 'superadmin']);
      if (!silent) console.log(`👤 Default admin user created: ${adminEmail}`);
    } else {
      if (!silent) console.log(`👤 Admin user exists: ${adminEmail}`);
    }

    // Seed initial Brands
    const brandCount = await query('SELECT COUNT(*) as count FROM brands WHERE is_deleted = FALSE');
    const count = parseInt(brandCount.rows[0]?.count || 0, 10);
    if (count === 0) {
      const initialBrands = [
        { name: 'Myra', logo: 'images/brands/myra.png', order: 1, url: 'https://myralk.com', desc: 'Luxury beauty and cosmetics brand in Sri Lanka' },
        { name: 'Hijaz', logo: 'images/brands/hijaz-logo.png', order: 2, url: 'https://hijazfood.com', desc: 'Premium food and confectionery chain' },
        { name: 'Uneeflow', logo: 'images/brands/uneeflow.png', order: 3, url: 'https://uneeflow.com', desc: 'Enterprise workflow & AI automation platform in UAE' },
        { name: 'Al Fakhir', logo: 'images/brands/al-fakhir.png', order: 4, url: 'https://alfakhir.sa', desc: 'Luxury hospitality & dining experience in Saudi Arabia' },
        { name: 'Mahanama', logo: 'images/brands/mahanama.png', order: 5, url: 'https://mahanama.lk', desc: 'Premier educational and training institution' },
        { name: 'Lucky Darbar', logo: 'images/brands/lucky-darbar.png', order: 6, url: 'https://luckydarbar.com', desc: 'Authentic gourmet dining chain' },
        { name: 'Crane Shoes', logo: 'images/brands/crane-shoes.png', order: 7, url: 'https://craneshoes.in', desc: 'Modern footwear & lifestyle brand across India' },
        { name: 'Fly Bagdad', logo: 'images/brands/fly-bagdad.png', order: 8, url: 'https://flybagdad.com', desc: 'Regional aviation and flight booking network' },
      ];

      for (const b of initialBrands) {
        await query(`
          INSERT INTO brands (company_name, logo_url, website_url, description, display_order, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [b.name, b.logo, b.url, b.desc, b.order, 'published']);
      }
      console.log(`🏢 Seeded ${initialBrands.length} initial brand partners.`);
    }

    // Seed initial Portfolio Projects
    const initialProjects = [
      {
        id: 'myra',
        slug: 'myra',
        brand: 'Myra',
        title: 'Full Brand Rejuvenation & E-Commerce Scaler',
        category: 'Branding',
        year: '2026',
        status: 'published',
        short_description: 'A connected brand and campaign direction designed to make Myra feel coherent across every customer touchpoint while creating a stronger platform for future growth.',
        cover_image: 'images/portfolio/myra-cover.jpg',
        featured_image: 'images/portfolio/myra-cover.jpg',
        logo_url: 'images/brands/myra.png',
        services: JSON.stringify(['branding', 'social', 'campaigns']),
        industry: 'Beauty & Wellness',
        market: 'Sri Lanka & UAE',
        location: 'Colombo, Sri Lanka',
        challenge: 'Legacy workflows and fragmented brand touchpoints created high customer drop-off before checkout across retail channels.',
        approach: 'Unified digital design system, conversion-focused e-commerce storefront, and high-performance Meta creative funnels.',
        deliverables: 'Brand direction, social design system, campaign concepts, launch toolkit and performance-ready creative templates.',
        metrics: JSON.stringify(['+240% Sales Growth', '4.8x Ad ROI', '1.2M+ Reach']),
        order: 1
      },
      {
        id: 'hijaz',
        slug: 'hijaz',
        brand: 'Hijaz',
        title: 'Gourmet FMCG Brand Expansion & Digital Retail',
        category: 'Branding',
        year: '2026',
        status: 'published',
        short_description: 'Packaging overhaul, nationwide social media blitz, and automated distributor portal accelerating retail growth.',
        cover_image: 'images/portfolio/hijaz-cover.jpg',
        featured_image: 'images/portfolio/hijaz-cover.jpg',
        logo_url: 'images/brands/hijaz-logo.png',
        services: JSON.stringify(['branding', 'social', 'campaigns']),
        industry: 'Gourmet FMCG',
        market: 'Sri Lanka',
        location: 'Colombo, Sri Lanka',
        challenge: 'Outdated packaging aesthetics and fragmented distributor ordering limited nationwide distribution efficiency.',
        approach: 'Full retail packaging redesign, high-impact influencer food campaigns, and digital distributor portal.',
        deliverables: 'Packaging design series, distributor management web app, social content library, point-of-sale retail creative.',
        metrics: JSON.stringify(['+310% Retail Orders', '2.5M Impressions', '50+ Distributors']),
        order: 2
      },
      {
        id: 'uneeflow',
        slug: 'uneeflow',
        brand: 'Uneeflow',
        title: 'Enterprise AI Workflow & Growth Automation',
        category: 'Systems',
        year: '2026',
        status: 'published',
        short_description: 'Architecting an end-to-end client acquisition and automated CRM system processing 10k+ leads weekly with zero downtime.',
        cover_image: 'images/portfolio/uneeflow-cover.jpg',
        featured_image: 'images/portfolio/uneeflow-cover.jpg',
        logo_url: 'images/brands/uneeflow.png',
        services: JSON.stringify(['websites', 'systems', 'automation']),
        industry: 'Enterprise AI & SaaS',
        market: 'UAE & GCC',
        location: 'Dubai, UAE',
        challenge: 'High manual lead triaging load created response delays and dropped enterprise deal closure rates.',
        approach: 'Built custom AI qualifying agent with integrated CRM sync and high-speed multi-step lead onboarding pipelines.',
        deliverables: 'Automated CRM architecture, multi-channel lead qualifier, conversion analytics dashboard, API integrations.',
        metrics: JSON.stringify(['10k+ Weekly Leads', '85% Auto-qualification', '0 Downtime']),
        order: 3
      },
      {
        id: 'al-fakhir',
        slug: 'al-fakhir',
        brand: 'Al Fakhir',
        title: 'Luxury Hospitality Digital Transformation',
        category: 'Websites',
        year: '2026',
        status: 'published',
        short_description: 'High-touch guest reservation platform and bespoke brand identity across Riyadh and Jeddah destinations.',
        cover_image: 'images/portfolio/alfakhir-cover.jpg',
        featured_image: 'images/portfolio/alfakhir-cover.jpg',
        logo_url: 'images/brands/al-fakhir.png',
        services: JSON.stringify(['branding', 'social', 'campaigns']),
        industry: 'Luxury Hospitality',
        market: 'Saudi Arabia',
        location: 'Riyadh & Jeddah, KSA',
        challenge: 'Heavy reliance on third-party aggregators reduced profit margins and diluted high-end guest brand experience.',
        approach: 'Designed bespoke direct-booking portal paired with luxury lifestyle storytelling and VIP guest retention funnels.',
        deliverables: 'Custom reservation web system, Arabic/English multilingual UI, premium photo & video asset suite.',
        metrics: JSON.stringify(['+180% Direct Bookings', '99.9% Uptime', '4.9★ Rating']),
        order: 4
      },
      {
        id: 'mahanama',
        slug: 'mahanama',
        brand: 'Mahanama',
        title: 'Educational Institution Platform & Identity',
        category: 'Websites',
        year: '2026',
        status: 'published',
        short_description: 'Bespoke modern educational portal and student onboarding campaigns driving institutional leadership.',
        cover_image: '',
        featured_image: '',
        logo_url: 'images/brands/mahanama.png',
        services: JSON.stringify(['websites', 'branding', 'campaigns']),
        industry: 'Education & Training',
        market: 'Sri Lanka',
        location: 'Colombo, Sri Lanka',
        challenge: 'Paper-based student admissions and outdated web presence slowed down semester intake processing.',
        approach: 'Engineered student self-service application portal with automated document verification and admission campaigns.',
        deliverables: 'Responsive student admissions platform, institutional brand guidelines, social campaign launch kit.',
        metrics: JSON.stringify(['+150% Enrollment', '98% Positive Feedback', '50k+ Visitors']),
        order: 5
      },
      {
        id: 'lucky-darbar',
        slug: 'lucky-darbar',
        brand: 'Lucky Darbar',
        title: 'Culinary Brand Experience & Social Growth',
        category: 'Branding',
        year: '2026',
        status: 'published',
        short_description: 'Full culinary brand identity, menu architecture, and viral social campaigns increasing restaurant footfall.',
        cover_image: '',
        featured_image: '',
        logo_url: 'images/brands/lucky-darbar.png',
        services: JSON.stringify(['branding', 'social', 'campaigns']),
        industry: 'Gourmet Dining Chain',
        market: 'Sri Lanka & India',
        location: 'Colombo, Sri Lanka',
        challenge: 'Competitive regional dining market required distinctive positioning to drive repeat customer footfall.',
        approach: 'Crafted authentic heritage visual identity, sensory food videography, and geo-targeted social activations.',
        deliverables: 'Brand identity system, physical and digital menu designs, video reels library, geo-fenced social ad campaigns.',
        metrics: JSON.stringify(['+220% Footfall', '3.5x ROI', '800k+ Reach']),
        order: 6
      },
      {
        id: 'crane-shoes',
        slug: 'crane-shoes',
        brand: 'Crane Shoes',
        title: 'Footwear & Lifestyle E-Commerce Store',
        category: 'Websites',
        year: '2026',
        status: 'published',
        short_description: 'High converting lifestyle retail portal and influencer campaign series scaling direct-to-consumer sales.',
        cover_image: '',
        featured_image: '',
        logo_url: 'images/brands/crane-shoes.png',
        services: JSON.stringify(['websites', 'branding', 'social']),
        industry: 'Retail & Footwear',
        market: 'India',
        location: 'Mumbai, India',
        challenge: 'Low mobile checkout conversion rates on legacy store restricted direct-to-consumer sales velocity.',
        approach: 'Re-architected lightning-fast mobile-first e-commerce checkout with dynamic sizing guides and social proof.',
        deliverables: 'E-commerce web application, influencer creator toolkit, high-converting product detail templates.',
        metrics: JSON.stringify(['+190% DTC Sales', '4.2x ROAS', '350k+ Units']),
        order: 7
      },
      {
        id: 'fly-bagdad',
        slug: 'fly-bagdad',
        brand: 'Fly Bagdad',
        title: 'Aviation Portal & Booking Automation',
        category: 'Systems',
        year: '2026',
        status: 'published',
        short_description: 'Streamlined regional flight booking architecture and automated ticket processing workflows.',
        cover_image: '',
        featured_image: '',
        logo_url: 'images/brands/fly-bagdad.png',
        services: JSON.stringify(['websites', 'campaigns', 'automation']),
        industry: 'Aviation & Travel',
        market: 'Iraq & Regional',
        location: 'Baghdad, Iraq',
        challenge: 'High booking abandon rate due to slow payment verification and disjointed regional ticket dispatch.',
        approach: 'Engineered high-concurrency ticket booking engine with real-time seat selection and SMS confirmation automation.',
        deliverables: 'Flight reservation engine, payment gateway connectors, ticket dispatch automation, performance ad system.',
        metrics: JSON.stringify(['40k+ Monthly Bookings', '99.9% Uptime', '3.8x Speed']),
        order: 8
      }
    ];

    for (const p of initialProjects) {
      const exists = await query('SELECT id FROM portfolio_projects WHERE id = $1', [p.id]);
      if (!exists.rows || exists.rows.length === 0) {
        await query(`
          INSERT INTO portfolio_projects (
            id, slug, brand, title, category, year, status,
            short_description, cover_image, featured_image, logo_url,
            services, industry, market, location, challenge, approach, deliverables, metrics, display_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        `, [
          p.id, p.slug, p.brand, p.title, p.category, p.year, p.status,
          p.short_description, p.cover_image, p.featured_image, p.logo_url,
          p.services, p.industry, p.market, p.location, p.challenge, p.approach, p.deliverables, p.metrics, p.order
        ]);
      } else {
        // Update existing row with full new fields
        await query(`
          UPDATE portfolio_projects SET
            short_description = $1,
            industry = $2,
            market = $3,
            location = $4,
            challenge = $5,
            approach = $6,
            deliverables = $7,
            metrics = $8,
            title = $9
          WHERE id = $10
        `, [
          p.short_description, p.industry, p.market, p.location,
          p.challenge, p.approach, p.deliverables, p.metrics, p.title, p.id
        ]);
      }
    }
    if (!silent) console.log(`📁 Portfolio projects verified & updated (8 core projects with full case studies).`);

    // Seed initial Hero Video
    const videoCount = await query('SELECT COUNT(*) as count FROM videos');
    const vCount = parseInt(videoCount.rows[0]?.count || 0, 10);
    if (vCount === 0) {
      await query(`
        INSERT INTO videos (title, description, video_url, video_type, poster_url, is_hero, autoplay, loop, muted, controls, placements, display_order, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        'Homepage Hero Reel 2026',
        'Showcase of high impact marketing campaigns and digital systems',
        'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41228-large.mp4',
        'html5',
        'images/hero-poster.jpg',
        true,
        true,
        true,
        true,
        false,
        JSON.stringify(['Homepage Hero', 'Homepage Video Section']),
        1,
        true
      ]);
      if (!silent) console.log('🎥 Seeded initial Hero Video.');
    }

    // Seed initial Creatives
    const creativeCount = await query('SELECT COUNT(*) as count FROM creatives');
    const cCount = parseInt(creativeCount.rows[0]?.count || 0, 10);
    if (cCount === 0) {
      const initialCreatives = [
        { title: 'Modern Brand Identity 3D', desc: '3D typography & visual system', img: 'images/brands/myra.png', cat: 'Branding', place: '["Homepage","Portfolio","Creative Gallery"]', order: 1 },
        { title: 'Motion Graphics Reel Asset', desc: 'Dynamic vector motion art', img: 'images/brands/uneeflow.png', cat: 'Motion', place: '["Homepage","Featured Section"]', order: 2 },
      ];
      for (const c of initialCreatives) {
        await query(`
          INSERT INTO creatives (title, description, image_url, category, placements, display_order, is_published)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [c.title, c.desc, c.img, c.cat, c.place, c.order, true]);
      }
      if (!silent) console.log('🎨 Seeded initial Creatives.');
    }

    // Seed initial Hero Bento items (16 items across 3 columns)
    const heroBentoCount = await query('SELECT COUNT(*) as count FROM hero_bento WHERE is_deleted = FALSE');
    const hbCount = parseInt(heroBentoCount.rows[0]?.count || 0, 10);
    if (hbCount === 0) {
      const initialBentoItems = [
        // Column 1
        { name: 'Myra Creative', media_type: 'image', media_url: 'images/brand-creatives/myra.jpg', poster_url: '', column_index: 1, display_order: 1, status: 'published' },
        { name: 'Hijaz Pasta Creative', media_type: 'image', media_url: 'images/brand-creatives/hijaz_pasta.jpg', poster_url: '', column_index: 1, display_order: 2, status: 'published' },
        { name: 'Top Baller Video Creative', media_type: 'video', media_url: 'images/brand-creatives/topballer-vid-creative.mp4', poster_url: '', column_index: 1, display_order: 3, status: 'published' },
        { name: 'Onex Roze Creative', media_type: 'image', media_url: 'images/brand-creatives/onex-roze.jpg', poster_url: '', column_index: 1, display_order: 4, status: 'published' },

        // Column 2
        { name: 'Hijaz Ad Video', media_type: 'video', media_url: 'images/brand-creatives/hijaz-ad.mp4', poster_url: '', column_index: 2, display_order: 1, status: 'published' },
        { name: 'Uneeflow Creative', media_type: 'image', media_url: 'images/brand-creatives/uneeflow-creative.jpg', poster_url: '', column_index: 2, display_order: 2, status: 'published' },
        { name: 'Al Fakhir Creative', media_type: 'image', media_url: 'images/brand-creatives/al-fakhir.jpg', poster_url: '', column_index: 2, display_order: 3, status: 'published' },
        { name: 'Mahanama Creative', media_type: 'image', media_url: 'images/brand-creatives/mahanama.jpg', poster_url: '', column_index: 2, display_order: 4, status: 'published' },
        { name: 'Zafiro Ad Video', media_type: 'video', media_url: 'images/brand-creatives/zafiro-ad.mp4', poster_url: '', column_index: 2, display_order: 5, status: 'published' },
        { name: 'Lucky Darbar Creative', media_type: 'image', media_url: 'images/brand-creatives/lucky-darbar.jpg', poster_url: '', column_index: 2, display_order: 6, status: 'published' },
        { name: 'The Convenience Store Creative', media_type: 'image', media_url: 'images/brand-creatives/convenience-store.jpg', poster_url: '', column_index: 2, display_order: 7, status: 'published' },

        // Column 3
        { name: 'Tuk Tuk Creative', media_type: 'image', media_url: 'images/brand-creatives/tuktuk-creative.jpg', poster_url: '', column_index: 3, display_order: 1, status: 'published' },
        { name: 'Dan Massey Creative', media_type: 'image', media_url: 'images/brand-creatives/dan-massey.jpg', poster_url: '', column_index: 3, display_order: 2, status: 'published' },
        { name: 'Crane Shoes Creative', media_type: 'image', media_url: 'images/brand-creatives/crane-shoes.jpg', poster_url: '', column_index: 3, display_order: 3, status: 'published' },
        { name: 'Myra Newspaper Video', media_type: 'video', media_url: 'images/brand-creatives/myra-newspaper.mp4', poster_url: '', column_index: 3, display_order: 4, status: 'published' },
        { name: 'Fly Bagdad Creative', media_type: 'image', media_url: 'images/brand-creatives/fly-bagdad.jpg', poster_url: '', column_index: 3, display_order: 5, status: 'published' },
      ];

      for (const item of initialBentoItems) {
        await query(`
          INSERT INTO hero_bento (name, media_type, media_url, poster_url, column_index, display_order, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [item.name, item.media_type, item.media_url, item.poster_url, item.column_index, item.display_order, item.status]);
      }
      if (!silent) console.log(`✨ Seeded ${initialBentoItems.length} initial Hero Bento media items across 3 columns.`);
    }

    // Seed initial Audit Log
    await query(`
      INSERT INTO audit_logs (admin_user, action, module, record_id, description, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, ['System', 'INITIALIZE', 'System', '0', 'Database schema initialized and seed data successfully populated', '127.0.0.1', 'CAMBM Setup CLI']);

    if (!silent) console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Allow direct execution: node server/scripts/init-db.js
if (process.argv[1] && process.argv[1].endsWith('init-db.js')) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
