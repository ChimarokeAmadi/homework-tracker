// The app must start however it's launched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'homework-entry-'));
const env = { ...process.env, HOMEWORK_FILE: join(temp, 'homework.json') };
const start = (file) => execFileSync(process.execPath, [file, 'help'], { env, encoding: 'utf8' });

test('starts directly', () => {
  assert.match(start(join(root, 'src/cli.js')), /Usage:/);
});

test('starts through a link, like the one npm creates for the homework command', () => {
  const link = join(temp, 'homework');
  symlinkSync(join(root, 'src/cli.js'), link);
  assert.match(start(link), /Usage:/);
});

test('starts from a folder with a space in its name', () => {
  const folder = join(temp, 'my project');
  mkdirSync(folder);
  cpSync(join(root, 'src'), join(folder, 'src'), { recursive: true });
  cpSync(join(root, 'package.json'), join(folder, 'package.json'));
  assert.match(start(join(folder, 'src/cli.js')), /Usage:/);
});
