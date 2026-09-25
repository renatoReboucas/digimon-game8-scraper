import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const { createInterfaceMock, runScrapeMock, startWebServerMock } = vi.hoisted(() => ({
  createInterfaceMock: vi.fn(),
  runScrapeMock: vi.fn(),
  startWebServerMock: vi.fn(),
}));

vi.mock('node:readline/promises', () => ({ createInterface: createInterfaceMock }));
vi.mock('../src/scrape-digimon.js', () => ({ runScrape: runScrapeMock }));
vi.mock('../src/web-server.js', () => ({ startWebServer: startWebServerMock }));

import { startCli } from '../src/cli.js';

const temporaryDirectories = [];

function configureAnswers(answers) {
  const rl = {
    question: vi.fn(async () => answers.shift() ?? '5'),
    close: vi.fn(),
  };
  createInterfaceMock.mockReturnValue(rl);
  return rl;
}

async function createDirectory() {
  const directory = await mkdtemp(path.join(tmpdir(), 'digimon-cli-'));
  temporaryDirectories.push(directory);
  return directory;
}

beforeEach(() => {
  vi.clearAllMocks();
  runScrapeMock.mockResolvedValue({ count: 2, output: 'digimon-enriched.json' });
  startWebServerMock.mockResolvedValue({ url: 'http://127.0.0.1:3000', server: {} });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('startCli', () => {
  it('repete o menu após opção inválida e fecha ao sair', async () => {
    const rl = configureAnswers(['x', '5']);

    await startCli()

    expect(console.log).toHaveBeenCalledWith('Opcao invalida. Escolha 1, 2, 3, 4 ou 5.');
    expect(console.log).toHaveBeenCalledWith('Ate logo.');
    expect(rl.close).toHaveBeenCalledOnce();
  });

  it('cancela sobrescrita de output existente sem executar scraper', async () => {
    const directory = await createDirectory();
    const outputFile = path.join(directory, 'digimon-enriched.json');
    const inputFile = path.join(directory, 'digimon.json');
    runScrapeMock.mockResolvedValue({ count: 2, output: outputFile });
    await writeFile(outputFile, '{}');
    configureAnswers(['1', 'nao', '5']);

    await startCli({ inputFile, outputFile });

    expect(runScrapeMock).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Captura cancelada.');
  });

  it('captura quando output não existe e informa falha do scraper', async () => {
    const directory = await createDirectory();
    const outputFile = path.join(directory, 'digimon-enriched.json');
    const inputFile = path.join(directory, 'digimon.json');
    runScrapeMock.mockResolvedValue({ count: 2, output: outputFile });
    configureAnswers(['1', '5']);

    await startCli({ inputFile, outputFile });

    expect(runScrapeMock).toHaveBeenCalledWith({ input: inputFile, output: outputFile, force: false });
    expect(console.log).toHaveBeenCalledWith(`Captura concluida: 2 itens em ${outputFile}.`);

    runScrapeMock.mockRejectedValueOnce(new Error('Falha de rede'));
    configureAnswers(['1', '5']);
    await startCli({ inputFile, outputFile: path.join(directory, 'another-output.json') });
    expect(console.error).toHaveBeenCalledWith('Captura nao concluida: Falha de rede');
  });

  it('bloqueia apagar arquivo de entrada e remove output somente após confirmação válida', async () => {
    const directory = await createDirectory();
    const sameFile = path.join(directory, 'digimon-enriched.json');
    const outputFile = path.join(directory, 'digimon-enriched.json');
    await writeFile(outputFile, 'output');
    configureAnswers(['2', 'digimon-enriched.json', '5']);

    await startCli({ inputFile: sameFile, outputFile });

    expect(console.log).toHaveBeenCalledWith('Operacao bloqueada: o arquivo informado nao e um output permitido.');
    expect(await import('node:fs/promises').then(({ access }) => access(outputFile)).then(() => true, () => false)).toBe(true);

    const inputFile = path.join(directory, 'source.json');
    configureAnswers(['2', 'digimon-enriched.json', '5']);
    await startCli({ inputFile, outputFile });

    expect(await import('node:fs/promises').then(({ access }) => access(outputFile)).then(() => true, () => false)).toBe(false);
  });

  it('retorna sem perguntar confirmação se output não existe', async () => {
    const directory = await createDirectory();
    const rl = configureAnswers(['2', '5']);
    const outputFile = path.join(directory, 'digimon-enriched.json');

    await startCli({ inputFile: path.join(directory, 'digimon.json'), outputFile });

    expect(console.log).toHaveBeenCalledWith(`Nenhum output encontrado em ${outputFile}.`);
    expect(rl.question).toHaveBeenCalledTimes(2);
  });

  it('recomeça o scraping e remove cache/imagens preservando .gitkeep', async () => {
    const directory = await createDirectory();
    const inputFile = path.join(directory, 'digimon.json');
    const outputFile = path.join(directory, 'digimon-enriched.json');
    const cachePath = path.join(directory, '.cache', 'scrape-cache.json');
    const imagesDir = path.join(directory, 'images');
    await mkdir(path.dirname(cachePath), { recursive: true });
    await mkdir(imagesDir, { recursive: true });
    await writeFile(inputFile, '{}');
    await writeFile(outputFile, '{}');
    await writeFile(cachePath, '{}');
    await writeFile(path.join(imagesDir, '.gitkeep'), '');
    await writeFile(path.join(imagesDir, 'local.png'), 'image');
    runScrapeMock.mockResolvedValue({ count: 2, output: outputFile });
    configureAnswers(['3', 's', '5']);

    await startCli({ inputFile, outputFile, cachePath, imagesDir });

    expect(runScrapeMock).toHaveBeenCalledWith({ input: inputFile, output: outputFile, cachePath, imagesDir, force: true });
    expect(console.log).toHaveBeenCalledWith(`Nova captura concluida: 2 itens em ${outputFile}.`);
    expect(await import('node:fs/promises').then(({ access }) => access(inputFile)).then(() => true)).toBe(true);
    expect(await import('node:fs/promises').then(({ access }) => access(path.join(imagesDir, '.gitkeep'))).then(() => true)).toBe(true);
  });

  it('abre o servidor web ou informa falha sem encerrar o menu', async () => {
    configureAnswers(['4']);
    await startCli({ outputFile: 'catalog.json' });
    expect(startWebServerMock).toHaveBeenCalledWith({ dataFile: 'catalog.json' });
    expect(console.log).toHaveBeenCalledWith('Servidor web iniciado em http://127.0.0.1:3000. Pressione Ctrl+C para encerrar.');

    startWebServerMock.mockRejectedValueOnce(new Error('Catálogo ausente'));
    configureAnswers(['4', '5']);
    await startCli({ outputFile: 'missing.json' });
    expect(console.error).toHaveBeenCalledWith('Servidor nao iniciado: Catálogo ausente');
  });
});