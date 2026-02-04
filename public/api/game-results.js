const fs = require('fs');
const path = require('path');

const FILE = path.join('/tmp', 'game_results.json');

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'GET') {
      res.json(read());
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).end();
      return;
    }
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const record = {
          id: Date.now(),
          game1: payload.game1,
          game2: payload.game2,
          game3: payload.game3,
          game4: payload.game4,
          game5: payload.game5,
          completedAt: payload.completedAt
        };
        const data = read();
        data.push(record);
        write(data);
        res.status(200).json({ success: true, id: record.id });
      } catch (e) {
        res.status(400).json({ error: 'Invalid JSON' });
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
