import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { downloadImage, getLocalImagePath, parseDigivolutions } from '../src/scrape-digimon.js';
import { canDeleteOutput } from '../src/cli.js';

afterEach(() => vi.restoreAllMocks());

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
});