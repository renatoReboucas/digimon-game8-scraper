import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_INPUT = 'digimon.json';
const DEFAULT_OUTPUT = 'digimon-enriched.json';
const DEFAULT_CACHE = path.join('.cache', 'scrape-cache.json');
const DEFAULT_IMAGES_DIR = path.join('src', 'images');
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function getImageUrl($, anchor, pageUrl) {
  const container = anchor.closest('a, td, li, figure, article, [class*="card"], [class*="Card"]');
  const image = (container.length ? container : anchor).find('img').first();
  if (!image.length) return null;

  const source = image.attr('data-src') || image.attr('data-lazy-src') || image.attr('data-original') || image.attr('src');
  const srcset = image.attr('data-srcset') || image.attr('srcset');
  const candidate = source || (srcset ? srcset.split(',')[0].trim().split(/\s+/)[0] : null);
  if (!candidate) return null;

  try {
    return new URL(candidate, pageUrl).href;
  } catch {
    return null;
  }
}

function getSectionNodes($, heading) {
  const level = Number(heading.name.slice(1));
  const nodes = [];
  let current = $(heading).next();

  while (current.length) {
    const name = current[0].name || '';
    if (/^h[1-6]$/i.test(name) && Number(name.slice(1)) <= level) break;
    nodes.push(current);
    current = current.next();
  }

  return nodes;
}

function extractItems($, nodes, pageUrl) {
  const items = [];
  const seen = new Set();

  for (const node of nodes) {
    node.find('a[href]').each((_, element) => {
      const anchor = $(element);
      const name = normalizeText(anchor.text()) || normalizeText(anchor.find('img').attr('alt'));
      const href = anchor.attr('href');
      if (!name || !href || /digivolution planner/i.test(name)) return;

      let url;
      try {
        url = new URL(href, pageUrl).href;
      } catch {
        return;
      }

      const key = `${name.toLowerCase()}|${url}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ name, url, imageUrl: getImageUrl($, anchor, pageUrl) });
    });
  }

  return items;
}

function deduplicateItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.name.toLowerCase()}|${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseDigivolutions(html, pageUrl) {
  const $ = cheerio.load(html);
  const result = { evolutions: [], deEvolutions: [] };

  $('h1, h2, h3, h4, h5, h6').each((_, element) => {
    const title = normalizeText($(element).text()).toLowerCase();
    const nodes = getSectionNodes($, element);

    if (/(^|\s)de[\s-]?digivolutions?$/.test(title)) {
      result.deEvolutions.push(...extractItems($, nodes, pageUrl));
    } else if (/(^|\s)(?:di)?givolutions?$|(^|\s)evolutions?$/.test(title)) {
      result.evolutions.push(...extractItems($, nodes, pageUrl));
    }
  });

  return {
    evolutions: deduplicateItems(result.evolutions),
    deEvolutions: deduplicateItems(result.deEvolutions)
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function imageFileName(imageUrl) {
  const parsedUrl = new URL(imageUrl);
  const extensionSegment = parsedUrl.pathname.split('/').reverse().find((segment) => /\.[a-z0-9]+$/i.test(segment));
  const extension = path.extname(extensionSegment || '').toLowerCase().replace(/[^a-z0-9.]/g, '') || '.img';
  const hash = createHash('sha256').update(imageUrl).digest('hex').slice(0, 20);
  return `${hash}${extension}`;
}

export function getLocalImagePath(imageUrl, imagesDir = DEFAULT_IMAGES_DIR) {
  if (!imageUrl) return null;
  return path.join(imagesDir, imageFileName(imageUrl));
}

function getLocalImageUrl(imageUrl) {
  return `/images/${imageFileName(imageUrl)}`;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseRetryAfter(value) {
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? 0 : Math.max(0, date - Date.now());
}

async function fetchPage(url, options = {}) {
  const retries = options.retries ?? 3;
  const timeout = options.timeout ?? 20000;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await axios.get(url, {
        timeout,
        responseType: 'text',
        validateStatus: () => true,
        headers: {
          'User-Agent': 'digimon-game8-scraper/1.0 (+local research tool)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.8'
        }
      });

      if (response.status >= 200 && response.status < 300) return response.data;
      if (!TRANSIENT_STATUSES.has(response.status) || attempt === retries) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const retryAfter = parseRetryAfter(response.headers['retry-after']);
      const backoff = Math.min(30000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 500);
      await sleep(Math.max(retryAfter, backoff));
    } catch (error) {
      if (attempt === retries || (error.status && !TRANSIENT_STATUSES.has(error.status)) || (error.response && !TRANSIENT_STATUSES.has(error.response.status))) {
        throw error;
      }
      const backoff = Math.min(30000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 500);
      await sleep(backoff);
    }
  }

  throw new Error(`Não foi possível acessar ${url}`);
}

async function loadCache(cachePath) {
  if (!(await exists(cachePath))) return {};
  try {
    return await readJson(cachePath);
  } catch {
    console.warn(`Aviso: cache inválido em ${cachePath}; iniciando sem cache.`);
    return {};
  }
}

async function saveCache(cachePath, cache) {
  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeJson(cachePath, cache);
}

export async function downloadImage(imageUrl, imagesDir) {
  const imagePath = getLocalImagePath(imageUrl, imagesDir);
  if (await exists(imagePath)) return getLocalImageUrl(imageUrl);

  const response = await axios.get(imageUrl, {
    timeout: 20000,
    responseType: 'arraybuffer',
    validateStatus: () => true,
    headers: {
      'User-Agent': 'digimon-game8-scraper/1.0 (+local research tool)',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`HTTP ${response.status}`);
  }

  await mkdir(imagesDir, { recursive: true });
  await writeFile(imagePath, response.data);
  return getLocalImageUrl(imageUrl);
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await callback(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function createRequestScheduler(minDelay, maxDelay) {
  let nextRequestAt = 0;
  let queue = Promise.resolve();

  return async function waitForRequestSlot() {
    let release;
    const previous = queue;
    queue = new Promise((resolve) => { release = resolve; });
    await previous;
    const wait = Math.max(0, nextRequestAt - Date.now());
    if (wait > 0) await sleep(wait);
    const delay = Math.max(minDelay, Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay);
    nextRequestAt = Date.now() + delay;
    release();
  };
}

async function enrichImages(item, imagesDir) {
  const localize = async (entry) => {
    if (!entry?.imageUrl) return entry;
    try {
      return { ...entry, localImageUrl: await downloadImage(entry.imageUrl, imagesDir) };
    } catch (error) {
      console.warn(`Falha ao baixar imagem de ${entry.name || 'item'} (${entry.imageUrl}): ${error.message}`);
      return entry;
    }
  };

  const [main, evolutions, deEvolutions] = await Promise.all([
    localize(item),
    mapWithConcurrency(item.Digivolutions.evolutions, 4, localize),
    mapWithConcurrency(item.Digivolutions.deEvolutions, 4, localize)
  ]);
  return {
    ...main,
    Digivolutions: {
      ...item.Digivolutions,
      evolutions,
      deEvolutions
    }
  };
}

export async function runScrape({
  input = DEFAULT_INPUT,
  output = DEFAULT_OUTPUT,
  cachePath = DEFAULT_CACHE,
  imagesDir = DEFAULT_IMAGES_DIR,
  minDelay = 2500,
  maxDelay = 5000,
  concurrency = 3,
  force = false
} = {}) {
  if (path.resolve(input) === path.resolve(output)) {
    throw new Error('O arquivo de entrada e o arquivo de saída precisam ser diferentes.');
  }
  if (!force && await exists(output)) {
    throw new Error(`O arquivo de saída já existe: ${output}. Use a CLI ou --force para sobrescrevê-lo.`);
  }

  const source = await readJson(input);
  const items = source?.collectionArraySchema?.collectionItems;
  if (!Array.isArray(items)) {
    throw new Error('JSON inválido: collectionArraySchema.collectionItems não é um array.');
  }

  const cache = await loadCache(cachePath);
  const enrichedItems = [];
  const pendingUrls = [...new Set(items.map((item) => item.url).filter((url) => url && !cache[url]))];
  const waitForRequestSlot = createRequestScheduler(minDelay, maxDelay);
  let completed = 0;
  await mapWithConcurrency(pendingUrls, concurrency, async (url) => {
    await waitForRequestSlot();
    const item = items.find((candidate) => candidate.url === url);
    try {
      console.log(`[${completed + 1}/${pendingUrls.length}] ${item?.name || url}`);
      cache[url] = parseDigivolutions(await fetchPage(url), url);
    } catch (error) {
      console.warn(`Falha em ${item?.name || url} (${url}): ${error.message}`);
      cache[url] = { evolutions: [], deEvolutions: [] };
    }
    completed += 1;
  });
  await saveCache(cachePath, cache);

  for (const item of items) {
    enrichedItems.push(await enrichImages({
      ...item,
      Digivolutions: cache[item.url] || { evolutions: [], deEvolutions: [] }
    }, imagesDir));
  }

  await writeJson(output, {
    ...source,
    collectionArraySchema: {
      ...source.collectionArraySchema,
      collectionItems: enrichedItems
    }
  });
  return { output, count: enrichedItems.length };
}

function parseArgs(argv) {
  const options = { input: DEFAULT_INPUT, output: DEFAULT_OUTPUT, minDelay: 2500, maxDelay: 5000, concurrency: 3, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--force') options.force = true;
    else if (argument.startsWith('--input=')) options.input = argument.slice(8);
    else if (argument.startsWith('--output=')) options.output = argument.slice(9);
    else if (argument.startsWith('--delay-min=')) options.minDelay = Number(argument.slice(12));
    else if (argument.startsWith('--delay-max=')) options.maxDelay = Number(argument.slice(12));
    else if (argument.startsWith('--concurrency=')) options.concurrency = Number(argument.slice(14));
    else if (argument === '--input' || argument === '--output' || argument === '--delay-min' || argument === '--delay-max' || argument === '--concurrency') {
      const value = argv[++index];
      if (argument === '--input') options.input = value;
      if (argument === '--output') options.output = value;
      if (argument === '--delay-min') options.minDelay = Number(value);
      if (argument === '--delay-max') options.maxDelay = Number(value);
      if (argument === '--concurrency') options.concurrency = Number(value);
    } else if (argument === '--help') {
      console.log('Uso: npm run scrape -- [--input arquivo] [--output arquivo] [--delay-min ms] [--delay-max ms] [--concurrency n] [--force]');
      process.exit(0);
    } else {
      throw new Error(`Opção desconhecida: ${argument}`);
    }
  }
  if (!Number.isFinite(options.minDelay) || !Number.isFinite(options.maxDelay) || options.minDelay < 0 || options.maxDelay < options.minDelay || !Number.isInteger(options.concurrency) || options.concurrency < 1) {
    throw new Error('Os intervalos de atraso são inválidos.');
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runScrape(parseArgs(process.argv.slice(2)))
    .then(({ output, count }) => console.log(`Concluído: ${count} itens gravados em ${output}.`))
    .catch((error) => {
      console.error(`Erro: ${error.message}`);
      process.exitCode = 1;
    });
}