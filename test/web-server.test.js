import { afterEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { createWebServer, loadDigimonData } from '../src/web-server.js';

const servers = [];
const temporaryDirectories = [];

function get(server, pathname) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const requestOptions = { host: '127.0.0.1', port: address.port, path: pathname };
    const client = request(requestOptions, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
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
});
