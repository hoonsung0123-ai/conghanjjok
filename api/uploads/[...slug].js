const fs = require('fs');
const path = require('path');
const url = require('url');

const UPLOADS = '/tmp/uploads';
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

module.exports = (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.status(405).end();
      return;
    }
    const pathname = url.parse(req.url || '', true).pathname || '';
    const match = pathname.match(/\/api\/uploads\/(.+)$/) || pathname.match(/\/uploads\/(.+)$/);
    const filename = (match ? match[1] : '').replace(/\.\./g, '').split('/')[0];
    if (!filename) {
      res.status(404).end();
      return;
    }
    const file = path.join(UPLOADS, filename);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.status(404).end();
      return;
    }
    const ext = path.extname(filename).toLowerCase();
    const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch (e) {
    res.status(404).end();
  }
};
