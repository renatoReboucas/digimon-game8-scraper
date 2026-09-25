import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseArgs } from '../src/scrape-digimon.js';

afterEach(() => vi.restoreAllMocks());

describe('scraper argument parser', () => {
  it('uses defaults and parses values with and without equals signs', () => {
    expect(parseArgs([])).toMatchObject({
      input: expect.stringMatching(/digimon\.json$/),
      output: expect.stringMatching(/digimon-enriched\.json$/),
      minDelay: 2500,
      maxDelay: 5000,
      concurrency: 3,
      force: false,
    });
    expect(parseArgs(['--input=source.json', '--output', 'target.json', '--delay-min', '10', '--delay-max=20', '--concurrency=4', '--force']))
      .toEqual({ input: 'source.json', output: 'target.json', minDelay: 10, maxDelay: 20, concurrency: 4, force: true });
  });

  it('rejects unknown options and invalid delay/concurrency ranges', () => {
    expect(() => parseArgs(['--wat'])).toThrow('Opcao desconhecida: --wat');
    expect(() => parseArgs(['--delay-min=-1'])).toThrow('Os intervalos de atraso sao invalidos.');
    expect(() => parseArgs(['--delay-max=2', '--delay-min=3'])).toThrow('Os intervalos de atraso sao invalidos.');
    expect(() => parseArgs(['--concurrency=1.5'])).toThrow('Os intervalos de atraso sao invalidos.');
  });

  it('prints help and exits successfully', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process exit');
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => parseArgs(['--help'])).toThrow('process exit');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Uso: npm run scrape'));
    expect(exit).toHaveBeenCalledWith(0);
  });
});