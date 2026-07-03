const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = '/Users/pengjiansheng/Desktop/RGTJ/frontend/dist';
const PORT = 18888;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  
  let filePath = path.join(DIST, urlPath);
  let ext = path.extname(filePath).toLowerCase();
  
  const sendFile = (p) => {
    const e = path.extname(p).toLowerCase();
    fs.readFile(p, (err, data) => {
      if (err) {
        res.writeHead(500); res.end('Server Error'); return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[e] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'Content-Length': data.length,
      });
      res.end(data);
    });
  };

  const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
  if (stat && stat.isDirectory()) {
    const idx = path.join(filePath, 'index.html');
    if (fs.existsSync(idx)) return sendFile(idx);
    return sendFile(path.join(DIST, 'index.html'));
  }
  if (stat && stat.isFile()) return sendFile(filePath);
  if (!ext || !MIME[ext]) return sendFile(path.join(DIST, 'index.html'));
  res.writeHead(404); res.end('Not found: ' + req.url);
});

server.listen(PORT, () => {
  console.log(`SPA 静态服务器运行于 http://localhost:${PORT}`);
  console.log(`根目录: ${DIST}`);
  console.log('任意未知路径 fallback 到 /index.html (支持 hash 路由)');
});
