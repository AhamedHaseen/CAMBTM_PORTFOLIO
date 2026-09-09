import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedAllBrands() {
  const brandsDir = path.join(__dirname, '..', '..', 'public', 'images', 'brands');
  const files = fs.readdirSync(brandsDir);
  console.log(`Found ${files.length} brand logo files.`);

  const existingRes = await query('SELECT logo_url FROM brands WHERE is_deleted = FALSE');
  const existingLogos = new Set((existingRes.rows || []).map(r => r.logo_url));

  let added = 0;
  for (const file of files) {
    const relUrl = `images/brands/${file}`;
    if (!existingLogos.has(relUrl)) {
      let rawName = file
        .replace(/\.(png|jpg|jpeg|webp|svg)$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\blogo\b/gi, '')
        .replace(/\bmonochrome\b/gi, '')
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase());

      if (!rawName) rawName = file;

      const countRes = await query('SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM brands WHERE is_deleted = FALSE');
      const nextOrder = parseInt(countRes.rows[0]?.next_order || 1, 10);

      await query(
        'INSERT INTO brands (company_name, logo_url, display_order, status) VALUES ($1, $2, $3, $4)',
        [rawName, relUrl, nextOrder, 'published']
      );
      added++;
    }
  }

  console.log(`Successfully added ${added} new brand logos to Supabase.`);
  const total = await query('SELECT COUNT(*) AS count FROM brands WHERE is_deleted = FALSE');
  console.log(`Total active brands in Supabase: ${total.rows[0]?.count}`);
  process.exit(0);
}

seedAllBrands().catch(err => {
  console.error('Error seeding brands:', err);
  process.exit(1);
});
