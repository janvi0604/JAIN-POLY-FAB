import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv.includes('--dist') ? path.join(projectRoot, 'dist') : projectRoot;
const port = Number(process.env.PORT || 4173);
const hostArgument = process.argv.slice(2).find(argument => argument.startsWith('--host='))?.slice(7)
  || process.argv.slice(2).find(argument => argument === '0.0.0.0' || /^\d{1,3}(\.\d{1,3}){3}$/.test(argument));
const host = hostArgument || process.env.HOST || '127.0.0.1';
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(root, `.${pathname}`);
  const localRoot = `${root}${path.sep}`.toLowerCase();
  if (!filePath.toLowerCase().startsWith(localRoot)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  process.stdout.write(`Jain Poly Fab site running on ${host}:${port}\n`);
});

server.on('error', error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
