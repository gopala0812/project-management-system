import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createServer } from 'node:http';

const root = resolve('client/dist');
const port = 5173;

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

if (!existsSync(join(root, 'index.html'))) {
  console.error('client/dist is missing. Run: npm run build --prefix client');
  process.exit(1);
}

createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);
  const requestedPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let filePath = resolve(root, `.${requestedPath}`);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, 'index.html');
  }

  res.writeHead(200, {
    'Content-Type': types[extname(filePath)] || 'application/octet-stream'
  });
  createReadStream(filePath).pipe(res);
}).listen(port, () => {
  console.log(`Frontend listening on http://localhost:${port}`);
});
