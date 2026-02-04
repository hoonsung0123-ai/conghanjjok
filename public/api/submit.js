const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const SUBMISSIONS_FILE = path.join('/tmp', 'submissions.json');
const UPLOADS_DIR = path.join('/tmp', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function readSubmissions() {
  try {
    return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeSubmissions(arr) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

module.exports = (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const form = formidable({
    maxFileSize: 5 * 1024 * 1024,
    uploadDir: UPLOADS_DIR,
    keepExtensions: true,
    filter: (part) => part.mimetype && part.mimetype.startsWith('image/')
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: '제출 처리 중 오류가 발생했습니다.' });
      return;
    }
    const get = (f) => (f && (Array.isArray(f) ? f[0] : f)) || '';
    const device = get(fields.device);
    const side = get(fields.side);
    const name = get(fields.name);
    const phone = get(fields.phone);
    const email = get(fields.email);
    const photoFile = files.photo && (Array.isArray(files.photo) ? files.photo[0] : files.photo);

    if (!device || !side || !name || !phone || !email || !photoFile) {
      res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
      return;
    }

    const origName = photoFile.originalFilename || photoFile.originalname || 'image.jpg';
    const newName = Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(origName);
    const dest = path.join(UPLOADS_DIR, newName);
    if (photoFile.filepath && photoFile.filepath !== dest) {
      fs.renameSync(photoFile.filepath, dest);
    }

    const submission = {
      id: Date.now(),
      device,
      side,
      name,
      phone,
      email,
      photoFilename: newName,
      createdAt: new Date().toISOString()
    };

    const submissions = readSubmissions();
    submissions.push(submission);
    writeSubmissions(submissions);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ success: true, id: submission.id });
  });
  } catch (e) {
    res.status(500).json({ error: '제출 처리 중 오류가 발생했습니다.' });
  }
};
