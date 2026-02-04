const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = (file.originalname && path.extname(file.originalname)) || '.jpg';
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  }
});

function readSubmissions() {
  try {
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeSubmissions(arr) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/submit', upload.single('photo'), (req, res) => {
  try {
    const { device, side, name, phone, email } = req.body;
    const photoFile = req.file;

    if (!device || !side || !name || !phone || !email || !photoFile) {
      return res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
    }

    const submission = {
      id: Date.now(),
      device,
      side,
      name,
      phone,
      email,
      photoFilename: photoFile.filename,
      createdAt: new Date().toISOString()
    };

    const submissions = readSubmissions();
    submissions.push(submission);
    writeSubmissions(submissions);

    res.json({ success: true, id: submission.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '제출 처리 중 오류가 발생했습니다.' });
  }
});

app.get('/api/submissions', (req, res) => {
  const submissions = readSubmissions();
  res.json(submissions);
});

app.get('/uploads/:filename', (req, res) => {
  const file = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).end();
  res.sendFile(path.resolve(file));
});

app.listen(PORT, () => {
  console.log(`콩 한쪽 서버: http://localhost:${PORT}`);
});
