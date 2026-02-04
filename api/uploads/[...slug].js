const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join('/tmp', 'uploads');

module.exports = (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.status(405).end();
      return;
    }
    const slug = req.query.slug;
    const filename = Array.isArray(slug) ? slug.join('/') : (slug || '');
    if (!filename || filename.includes('..')) {
      res.status(400).end();
      return;
    }
    const filePath = path.join(UPLOADS_DIR, path.basename(filename));
    if (!fs.existsSync(filePath)) {
      res.status(404).end();
      return;
    }
    const ext = path.extname(filename).toLowerCase();
    const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    const buf = fs.readFileSync(filePath);
    res.end(buf);
  } catch (e) {
    res.status(500).end();
  }
};
