// @ts-nocheck
import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const defaultDataFile = path.join(process.cwd(), 'data', 'digimon-enriched.json');

export async function loadDigimonData() {
  const dataFile = process.env.DIGIMON_DATA_FILE || defaultDataFile;
  let source;

  try {
    source = JSON.parse(await readFile(dataFile, 'utf8'));
  } catch (error) {
    throw new Error(`Nao foi possivel carregar os dados de Digimon: ${error.message}`);
  }

  const items = source?.collectionArraySchema?.collectionItems;
  if (!Array.isArray(items)) {
    throw new Error('JSON invalido: collectionArraySchema.collectionItems deve ser uma lista.');
  }

  return items;
}
