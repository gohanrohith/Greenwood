const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { query } = require('../config/db');

const UPLOADS_BASE = process.env.UPLOADS_DIR || path.join(__dirname, '../public/uploads');
const GTIMES_IMG_DIR = path.join(UPLOADS_BASE, 'gtimes');
fs.mkdirSync(GTIMES_IMG_DIR, { recursive: true });

// Download a remote image and save locally. Returns local URL path or null.
async function fetchImage(remoteUrl, filename) {
  const dest = path.join(GTIMES_IMG_DIR, filename);
  return new Promise(resolve => {
    const proto = remoteUrl.startsWith('https') ? https : http;
    const file  = fs.createWriteStream(dest);
    proto.get(remoteUrl, res => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return resolve(null);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve('/uploads/gtimes/' + filename); });
    }).on('error', () => {
      file.close();
      fs.unlink(dest, () => {});
      resolve(null);
    });
  });
}

exports.gtimesSync = async (req, res) => {
  const secret = process.env.GTIMES_WEBHOOK_SECRET;
  if (secret && req.body.secret !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type, action, campus = 'all', data } = req.body;
  if (!type || !action || !data) {
    return res.status(400).json({ error: 'Missing type, action, or data' });
  }

  try {
    if (type === 'event') {
      await syncEvent(action, campus, data);
    } else if (type === 'article') {
      await syncArticle(action, campus, data);
    } else {
      return res.status(400).json({ error: 'Unknown type' });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('GTimes sync error:', e.message);
    res.status(500).json({ error: 'Sync failed' });
  }
};

async function syncEvent(action, campus, data) {
  const { gtimes_id, title, description, event_date, image_url, category, gtimes_url } = data;

  if (action === 'delete') {
    await query('UPDATE events SET is_active = 0 WHERE gtimes_id = ?', [gtimes_id]);
    return;
  }

  let image = null;
  if (image_url && image_url.startsWith('http')) {
    const ext = path.extname(new URL(image_url).pathname) || '.jpg';
    image = await fetchImage(image_url, `event-${gtimes_id}${ext}`);
  }

  const existing = await query('SELECT id FROM events WHERE gtimes_id = ?', [gtimes_id]);
  if (existing.length > 0) {
    await query(
      `UPDATE events SET title=?, description=?, campus=?, event_date=?, image=?, category=?, gtimes_url=? WHERE gtimes_id=?`,
      [title, description || null, campus, event_date || null, image, category || 'general', gtimes_url || null, gtimes_id]
    );
  } else {
    await query(
      `INSERT INTO events (title, description, campus, event_date, image, category, source, gtimes_id, gtimes_url) VALUES (?,?,?,?,?,?,?,?,?)`,
      [title, description || null, campus, event_date || null, image, category || 'general', 'gtimes', gtimes_id, gtimes_url || null]
    );
  }
}

async function syncArticle(action, campus, data) {
  const { gtimes_id, title, excerpt, author, image_url, category, gtimes_url, published_at } = data;

  if (action === 'delete') {
    await query('UPDATE articles SET is_active = 0 WHERE gtimes_id = ?', [gtimes_id]);
    return;
  }

  let image = null;
  if (image_url && image_url.startsWith('http')) {
    const ext = path.extname(new URL(image_url).pathname) || '.jpg';
    image = await fetchImage(image_url, `article-${gtimes_id}${ext}`);
  }

  const existing = await query('SELECT id FROM articles WHERE gtimes_id = ?', [gtimes_id]);
  if (existing.length > 0) {
    await query(
      `UPDATE articles SET title=?, excerpt=?, campus=?, author=?, image=?, category=?, gtimes_url=?, published_at=? WHERE gtimes_id=?`,
      [title, excerpt || null, campus, author || null, image, category || 'news', gtimes_url || null, published_at || null, gtimes_id]
    );
  } else {
    await query(
      `INSERT INTO articles (title, excerpt, campus, author, image, category, source, gtimes_id, gtimes_url, published_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [title, excerpt || null, campus, author || null, image, category || 'news', 'gtimes', gtimes_id, gtimes_url || null, published_at || null]
    );
  }
}
