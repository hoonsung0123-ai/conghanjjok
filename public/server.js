'use strict';

const path = require('path');
const fs = require('fs');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function serveStatic(req, res) {
  let urlPath = (req.url || '/').split('?')[0];
  
  let filePath;
  
  // /games/* 요청 -> B 폴더
  if (urlPath.startsWith('/games')) {
    let subPath = urlPath.replace('/games', '') || '/';
    if (subPath === '/' || subPath === '') subPath = '/index.html';
    filePath = path.normalize(path.join(__dirname, 'B', subPath));
  } 
  // 그 외 요청 -> A 폴더
  else {
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
    filePath = path.normalize(path.join(__dirname, 'A', urlPath));
  }

  // 보안: 디렉터리 이탈 방지
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end();
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end();
    return;
  }
  
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    res.statusCode = 404;
    res.end();
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.end(fs.readFileSync(filePath));
}

module.exports = (req, res) => {
  serveStatic(req, res);
};
