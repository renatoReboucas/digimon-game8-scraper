import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { access, readdir, rm, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runScrape } from './scrape-digimon.js';
import { startWebServer } from './web-server.js';

const INPUT_FILE = 'digimon.json';
const OUTPUT_FILE = 'digimon-enriched.json';
const CACHE_FILE = path.join('.cache', 'scrape-cache.json');
const IMAGES_DIR = path.join('src', 'images');

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function canDeleteOutput(inputFile, outputFile) {
  return path.resolve(inputFile) !== path.resolve(outputFile) && path.basename(outputFile) === OUTPUT_FILE;
}

async function deleteOutput(rl, inputFile, outputFile) {
  if (!canDeleteOutput(inputFile, outputFile)) {
    console.log('Operacao bloqueada: o arquivo informado nao e um output permitido.');
    return;
  }
  if (!(await exists(outputFile))) {
    console.log(`Nenhum output encontrado em ${outputFile}.`);
    return;
  }

  const confirmation = await rl.question(`Para confirmar, digite ${OUTPUT_FILE}: `);
  if (confirmation.toLowerCase() !== OUTPUT_FILE.toLowerCase()) {
    console.log('Exclusao cancelada.');
    return;
  }
  await unlink(outputFile);
  console.log(`Output apagado: ${outputFile}`);
}

export async function removeScrapeArtifacts({ inputFile = INPUT_FILE, outputFile = OUTPUT_FILE, cachePath = CACHE_FILE, imagesDir = IMAGES_DIR, log = console.log } = {}) {
  const inputPath = path.resolve(inputFile);
  if ([outputFile, cachePath, imagesDir].some((target) => path.resolve(target) === inputPath)) {
    throw new Error('A limpeza foi bloqueada para preservar o arquivo de entrada.');
  }

  await rm(outputFile, { force: true });
  log(`Output removido: ${outputFile}`);

  await rm(cachePath, { force: true });
  log(`Cache removido: ${cachePath}`);

  let entries = [];
  try {
    entries = await readdir(imagesDir, { withFileTypes: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  for (const entry of entries) {
    if (entry.name === '.gitkeep') continue;
    await rm(path.join(imagesDir, entry.name), { recursive: true, force: true });
    log(`Imagem removida: ${path.join(imagesDir, entry.name)}`);
  }
}

export async function restartScrape({
  rl,
  inputFile = INPUT_FILE,
  outputFile = OUTPUT_FILE,
  cachePath = CACHE_FILE,
  imagesDir = IMAGES_DIR,
  scrape = runScrape,
  log = console.log
} = {}) {
  const confirmation = await rl.question('Tem certeza que deseja recomecar o scraping do zero? (s/N): ');
  if (!['s', 'sim'].includes(confirmation.trim().toLowerCase())) {
    log('Recomeco cancelado. Nenhum arquivo foi apagado.');
    return null;
  }

  await removeScrapeArtifacts({ inputFile, outputFile, cachePath, imagesDir, log });
  log('Iniciando nova captura do zero...');
  return scrape({ input: inputFile, output: outputFile, cachePath, imagesDir, force: true });
}

export async function startCli({ inputFile = INPUT_FILE, outputFile = OUTPUT_FILE, cachePath = CACHE_FILE, imagesDir = IMAGES_DIR } = {}) {
  const rl = createInterface({ input, output });
  try {
    while (true) {
      console.log('\n1. Capturar dados\n2. Apagar output\n3. Recomecar scraping do zero\n4. Abrir servidor web\n5. Sair');
      const choice = (await rl.question('Escolha uma opcao: ')).trim();

      if (choice === '1') {
        try {
          let force = false;
          if (await exists(outputFile)) {
            const confirmation = await rl.question(`O output ja existe. Digite ${OUTPUT_FILE} para sobrescrever: `);
            if (confirmation.toLowerCase() !== OUTPUT_FILE.toLowerCase()) {
              console.log('Captura cancelada.');
              continue;
            }
            force = true;
          }
          const result = await runScrape({ input: inputFile, output: outputFile, force });
          console.log(`Captura concluida: ${result.count} itens em ${result.output}.`);
        } catch (error) {
          console.error(`Captura nao concluida: ${error.message}`);
        }
      } else if (choice === '2') {
        await deleteOutput(rl, inputFile, outputFile);
      } else if (choice === '3') {
        try {
          const result = await restartScrape({ rl, inputFile, outputFile, cachePath, imagesDir });
          if (result) console.log(`Nova captura concluida: ${result.count} itens em ${result.output}.`);
        } catch (error) {
          console.error(`Nova captura nao concluida: ${error.message}`);
        }
      } else if (choice === '4') {
        try {
          const { url } = await startWebServer({ dataFile: outputFile });
          console.log(`Servidor web iniciado em ${url}. Pressione Ctrl+C para encerrar.`);
          return;
        } catch (error) {
          console.error(`Servidor nao iniciado: ${error.message}`);
        }
      } else if (choice === '5') {
        console.log('Ate logo.');
        return;
      } else {
        console.log('Opcao invalida. Escolha 1, 2, 3, 4 ou 5.');
      }
    }
  } finally {
    rl.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startCli().catch((error) => {
    console.error(`Erro na CLI: ${error.message}`);
    process.exitCode = 1;
  });
}