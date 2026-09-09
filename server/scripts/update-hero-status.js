import { query } from '../config/db.js';

async function updateStatus() {
  await query("UPDATE hero_bento SET status = 'published' WHERE is_deleted = FALSE");
  const r = await query("SELECT count(id) as count FROM hero_bento WHERE is_deleted = FALSE AND status = 'published'");
  const images = await query("SELECT count(id) as count FROM hero_bento WHERE is_deleted = FALSE AND status = 'published' AND media_type = 'image'");
  const videos = await query("SELECT count(id) as count FROM hero_bento WHERE is_deleted = FALSE AND status = 'published' AND media_type = 'video'");
  console.log(`✅ Success! Published items: ${r.rows[0].count} (Images: ${images.rows[0].count}, Videos: ${videos.rows[0].count})`);
  process.exit(0);
}

updateStatus().catch(console.error);
