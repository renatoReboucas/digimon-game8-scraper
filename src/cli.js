import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { access, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runScrape } from './scrape-digimon.js';
import { startWebServer } from './web-server.js';

const INPUT_FILE = 'digimon.json';
const OUTPUT_FILE = 'digimon-enriched.json';

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
    console.log('Operação bloqueada: o arquivo informado não é um output permitido.');
    return;
  }
  if (!(await exists(outputFile))) {
    console.log(`Nenhum output encontrado em ${outputFile}.`);
    return;
  }

  const confirmation = await rl.question(`Para confirmar, digite ${OUTPUT_FILE}: `);
  if (confirmation.trim() !== OUTPUT_FILE) {
    console.log('Exclusão cancelada.');
    return;
  }
  await unlink(outputFile);
  console.log(`Output apagado: ${outputFile}`);
}

export async function startCli({ inputFile = INPUT_FILE, outputFile = OUTPUT_FILE } = {}) {
  const rl = createInterface({ input, output });
  try {
    while (true) {
      console.log('\n1. Capturar dados\n2. Apagar output\n3. Abrir servidor web\n4. Sair');
      const choice = (await rl.question('Escolha uma opção: ')).trim();

      if (choice === '1') {
        try {
          let force = false;
          if (await exists(outputFile)) {
            const confirmation = await rl.question(`O output já existe. Digite ${OUTPUT_FILE} para sobrescrever: `);
            if (confirmation.trim() !== OUTPUT_FILE) {
              console.log('Captura cancelada.');
              continue;
            }
            force = true;
          }
          const result = await runScrape({ input: inputFile, output: outputFile, force });
          console.log(`Captura concluída: ${result.count} itens em ${result.output}.`);
        } catch (error) {
          console.error(`Captura não concluída: ${error.message}`);
        }
      } else if (choice === '2') {
        await deleteOutput(rl, inputFile, outputFile);
      } else if (choice === '3') {
        try {
          const { url } = await startWebServer({ dataFile: outputFile });
          console.log(`Servidor web iniciado em ${url}. Pressione Ctrl+C para encerrar.`);
          return;
        } catch (error) {
          console.error(`Servidor não iniciado: ${error.message}`);
        }
      } else if (choice === '4') {
        console.log('Até logo.');
        return;
      } else {
        console.log('Opção inválida. Escolha 1, 2, 3 ou 4.');
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