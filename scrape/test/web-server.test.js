import { afterEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer, request } from 'node:http';
import { createWebServer, loadDigimonData, startWebServer } from '../src/web-server.js';

const servers = [];
const temporaryDirectories = [];

function get(server, pathname, method = 'GET') {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const requestOptions = { host: '127.0.0.1', port: address.port, path: pathname, method };
    const client = request(requestOptions, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    client.on('error', reject);
    client.end();
  });
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('web server', () => {
  it('carrega os itens enriquecidos do JSON', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'digimon-server-'));
    temporaryDirectories.push(directory);
    const dataFile = join(directory, 'digimon-enriched.json');
    await writeFile(dataFile, JSON.stringify({ collectionArraySchema: { collectionItems: [{ name: 'Agumon' }] } }));

    await expect(loadDigimonData(dataFile)).resolves.toEqual([{ name: 'Agumon' }]);
  });

  it('serve a página e a API de Digimons', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'digimon-server-'));
    temporaryDirectories.push(directory);
    const dataFile = join(directory, 'digimon-enriched.json');
    const webDirectory = join(directory, 'web');
    await writeFile(dataFile, JSON.stringify({ collectionArraySchema: { collectionItems: [{ name: 'Agumon' }] } }));
    await mkdir(webDirectory, { recursive: true });
    await writeFile(join(webDirectory, 'index.html'), '');
    const server = await createWebServer({ dataFile, webDir: webDirectory });
    servers.push(server);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    const page = await get(server, '/');
    const api = await get(server, '/api/digimons');
    expect(page.status).toBe(200);
    expect(api.status).toBe(200);
    expect(JSON.parse(api.body)).toEqual([{ name: 'Agumon' }]);
  });

  it('informa quando o arquivo enriquecido não existe', async () => {
    await expect(loadDigimonData('arquivo-que-nao-existe.json')).rejects.toThrow('Execute a captura antes de abrir o servidor');
  });

  it('rejeita arquivos válidos como JSON mas sem collectionItems', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'digimon-server-invalid-'));
    temporaryDirectories.push(directory);
    const dataFile = join(directory, 'digimon-enriched.json');
    await writeFile(dataFile, JSON.stringify({ collectionArraySchema: { collectionItems: 'invalid' } }));

    await expect(loadDigimonData(dataFile)).rejects.toThrow('nao contem collectionArraySchema.collectionItems');
  });

  it('serve assets com MIME apropriado, resposta 404 e bloqueio de métodos não GET', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'digimon-server-assets-'));
    temporaryDirectories.push(directory);
    const dataFile = join(directory, 'digimon-enriched.json');
    const webDirectory = join(directory, 'web');
    const imagesDirectory = join(directory, 'images');
    await writeFile(dataFile, JSON.stringify({ collectionArraySchema: { collectionItems: [] } }));
    await mkdir(webDirectory, { recursive: true });
    await mkdir(imagesDirectory, { recursive: true });
    await writeFile(join(webDirectory, 'styles.css'), 'body {}');
    await writeFile(join(webDirectory, 'asset.bin'), 'binary');
    await writeFile(join(imagesDirectory, 'icon.svg'), '<svg />');
    const server = await createWebServer({ dataFile, webDir: webDirectory, imagesDir: imagesDirectory });
    servers.push(server);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

    const css = await get(server, '/styles.css');
    const image = await get(server, '/images/icon.svg');
    const unknown = await get(server, '/asset.bin');
    const missing = await get(server, '/missing.css');
    const post = await get(server, '/api/digimons', 'POST');

    expect(css.headers['content-type']).toBe('text/css; charset=utf-8');
    expect(image.headers['content-type']).toBe('image/svg+xml');
    expect(unknown.headers['content-type']).toBe('application/octet-stream');
    expect(missing.status).toBe(404);
    expect(missing.body).toBe('Nao encontrado.');
    expect(post.status).toBe(405);
    expect(post.headers.allow).toBe('GET');
  });

  it('inicia em uma porta disponível e rejeita uma porta já ocupada', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'digimon-server-start-'));
    temporaryDirectories.push(directory);
    const dataFile = join(directory, 'digimon-enriched.json');
    await writeFile(dataFile, JSON.stringify({ collectionArraySchema: { collectionItems: [] } }));
    const probe = createServer();
    await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
    const port = probe.address().port;
    await new Promise((resolve) => probe.close(resolve));

    const started = await startWebServer({ dataFile, port });
    servers.push(started.server);
    expect(started.url).toBe(`http://127.0.0.1:${port}`);
    await expect(startWebServer({ dataFile, port })).rejects.toMatchObject({ code: 'EADDRINUSE' });
  });
});
