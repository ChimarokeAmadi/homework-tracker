// Saves the list in a JSON file (homework.json, or the file in HOMEWORK_FILE).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export function filePath() {
  return process.env.HOMEWORK_FILE || 'homework.json';
}

export function load(path = filePath()) {
  if (!existsSync(path)) return [];
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return data.tasks;
}

export function save(list, path = filePath()) {
  writeFileSync(path, `${JSON.stringify({ tasks: list }, null, 2)}\n`);
}
