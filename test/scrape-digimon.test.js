import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { downloadImage, getLocalImagePath, parseDigivolutions } from '../src/scrape-digimon.js';
import { canDeleteOutput, restartScrape } from '../src/cli.js';

afterEach(() => vi.restoreAllMocks());

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe('scraper', () => {
  it('extrai e separa Digivolutions e De-Digivolutions', async () => {
    const html = await readFile(new URL('./fixtures/game8-page.html', import.meta.url), 'utf8');
    const result = parseDigivolutions(html, 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/552892');

    expect(result.evolutions).toEqual([{
      name: 'Agumon',
      url: 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/100',
      imageUrl: 'https://img.game8.co/evolution.png'
    }]);
    expect(result.deEvolutions).toEqual([{
      name: 'Gabumon',
      url: 'https://game8.co/games/Digimon-Story-Time-Stranger/archives/101',
      imageUrl: 'https://img.game8.co/gabumon.png'
    }]);
  });

  it('retorna listas vazias quando não há seções', () => {
    expect(parseDigivolutions('<html><body><h1>Agumon</h1></body></html>', 'https://game8.co/')).toEqual({
      evolutions: [],
      deEvolutions: []
    });
  });

  it('protege o arquivo de entrada contra exclusão', () => {
    expect(canDeleteOutput('digimon.json', 'digimon-enriched.json')).toBe(true);
    expect(canDeleteOutput('digimon.json', 'digimon.json')).toBe(false);
    expect(canDeleteOutput('digimon.json', 'qualquer.json')).toBe(false);
  });

  it('preserva a extensão em URLs de imagem com sufixo /show', () => {
    expect(getLocalImagePath('https://img.game8.co/123/image.png/show')).toMatch(/\.png$/);
  });

  it('reutiliza a imagem local sem baixá-la novamente', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'digimon-images-'));
    const imageUrl = 'https://img.game8.co/123/image.png/show';
    const download = vi.spyOn(axios, 'get').mockResolvedValue({ status: 200, data: Buffer.from('image') });
    const expectedLocalUrl = `/images/${path.basename(getLocalImagePath(imageUrl, directory))}`;
    try {
      await expect(downloadImage(imageUrl, directory)).resolves.toBe(expectedLocalUrl);
      await expect(downloadImage(imageUrl, directory)).resolves.toBe(expectedLocalUrl);
      expect(download).toHaveBeenCalledTimes(1);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('confirma o recomeço, remove artefatos, preserva entradas e inicia a captura depois da limpeza', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'digimon-restart-'));
    const inputFile = path.join(directory, 'digimon.json');
    const outputFile = path.join(directory, 'digimon-enriched.json');
    const cachePath = path.join(directory, '.cache', 'scrape-cache.json');
    const imagesDir = path.join(directory, 'images');
    const imagePath = path.join(imagesDir, 'downloaded.png');
    const keepPath = path.join(imagesDir, '.gitkeep');
    const logs = [];
    await mkdir(path.dirname(cachePath), { recursive: true });
    await mkdir(imagesDir, { recursive: true });
    await writeFile(inputFile, '{"preserved":true}');
    await writeFile(outputFile, 'output');
    await writeFile(cachePath, '{}');
    await writeFile(imagePath, 'image');
    await writeFile(keepPath, '');

    const scrape = vi.fn(async (options) => {
      expect(await exists(inputFile)).toBe(true);
      expect(await exists(outputFile)).toBe(false);
      expect(await exists(cachePath)).toBe(false);
      expect(await exists(imagePath)).toBe(false);
      return { output: options.output, count: 1 };
    });

    try {
      await expect(restartScrape({
        rl: { question: vi.fn().mockResolvedValue('ReCoMeCaR') },
        inputFile,
        outputFile,
        cachePath,
        imagesDir,
        scrape,
        log: (message) => logs.push(message)
      })).resolves.toEqual({ output: outputFile, count: 1 });

      expect(scrape).toHaveBeenCalledWith({ input: inputFile, output: outputFile, cachePath, imagesDir, force: true });
      expect(await readFile(inputFile, 'utf8')).toBe('{"preserved":true}');
      expect(await exists(keepPath)).toBe(true);
      expect(await exists(imagePath)).toBe(false);
      expect(logs).toContain('Iniciando nova captura do zero...');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('cancela com confirmação incorreta sem apagar nada nem iniciar a captura', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'digimon-restart-cancel-'));
    const outputFile = path.join(directory, 'digimon-enriched.json');
    const cachePath = path.join(directory, '.cache', 'scrape-cache.json');
    const imagesDir = path.join(directory, 'images');
    const imagePath = path.join(imagesDir, 'downloaded.png');
    const scrape = vi.fn();
    await mkdir(path.dirname(cachePath), { recursive: true });
    await mkdir(imagesDir, { recursive: true });
    await writeFile(outputFile, 'output');
    await writeFile(cachePath, '{}');
    await writeFile(imagePath, 'image');

    try {
      await expect(restartScrape({
        rl: { question: vi.fn().mockResolvedValue('RECOMECAR ') },
        outputFile,
        cachePath,
        imagesDir,
        scrape
      })).resolves.toBeNull();

      expect(scrape).not.toHaveBeenCalled();
      expect(await exists(outputFile)).toBe(true);
      expect(await exists(cachePath)).toBe(true);
      expect(await exists(imagePath)).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});