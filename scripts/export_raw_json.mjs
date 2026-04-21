import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rawPath = path.resolve(__dirname, '../data/raw.js');

const rawSource = await fs.readFile(rawPath, 'utf8');
const jsonSource = rawSource
  .replace(/^[\s\S]*?export const RAW=/, '')
  .replace(/;\s*$/, '');
const raw = JSON.parse(jsonSource);

process.stdout.write(JSON.stringify(raw, null, 2));
