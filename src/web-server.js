import { createServer } from 'node:http';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_DIR = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.join(SOURCE_DIR, 'web');
const IMAGES_DIR = path.join(SOURCE_DIR, 'images');
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

export async function loadDigimonData(dataFile = 'digimon-enriched.json') {
  let source;
  try {
    source = JSON.parse(await readFile(dataFile, 'utf8'));
  } catch (error) {
    throw new Error(`Nao foi possivel carregar ${dataFile}. Execute a captura antes de abrir o servidor: ${error.message}`);
  }

  const items = source?.collectionArraySchema?.collectionItems;
  if (!Array.isArray(items)) {
    throw new Error(`JSON invalido: ${dataFile} nao contem collectionArraySchema.collectionItems.`);
  }
  return items;
}

function safePath(root, pathname) {
  const candidate = path.resolve(root, `.${pathname}`);
  return candidate === root || candidate.startsWith(`${root}${path.sep}`) ? candidate : null;
}

async function sendFile(response, filePath, contentType) {
  try {
    const content = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Nao encontrado.');
  }
}

export async function createWebServer({ dataFile = 'digimon-enriched.json', webDir = WEB_DIR, imagesDir = IMAGES_DIR } = {}) {
  const items = await loadDigimonData(dataFile);
  return createServer(async (request, response) => {
    const requestUrl = new URL(request.url, 'http://localhost');
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET' });
      response.end();
      return;
    }

    if (requestUrl.pathname === '/api/digimons') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(items));
      return;
    }

    const root = requestUrl.pathname.startsWith('/images/') ? imagesDir : webDir;
    const relativePath = requestUrl.pathname.startsWith('/images/')
      ? requestUrl.pathname.slice('/images'.length)
      : requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const filePath = safePath(path.resolve(root), relativePath);
    if (!filePath) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Caminho invalido.');
      return;
    }
    await sendFile(response, filePath, CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
}

export async function startWebServer({ dataFile = 'digimon-enriched.json', port = 3000, host = '127.0.0.1' } = {}) {
  const server = await createWebServer({ dataFile });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  return { server, url: `http://${host}:${port}` };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startWebServer()
    .then(({ url }) => console.log(`Servidor iniciado em ${url}`))
    .catch((error) => {
      console.error(`Erro: ${error.message}`);
      process.exitCode = 1;
    });
}
