// Runs the real commands, with the list saved in a temporary file.
import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from '../src/cli.js';

function homework(...args) {
  const lines = [];
  run(args, (line) => lines.push(line));
  return lines.join('\n');
}

beforeEach(() => {
  process.env.HOMEWORK_FILE = join(mkdtempSync(join(tmpdir(), 'homework-')), 'homework.json');
});

test('add, list, done and remove', () => {
  assert.match(homework('add', 'Read chapter 3', '--subject', 'english'), /Added:\s+1 \[ \] Read chapter 3 \(english\)/);
  homework('add', 'Maths exercises');
  assert.match(homework('list'), /Read chapter 3[\s\S]*Maths exercises/);
  homework('done', '1');
  assert.doesNotMatch(homework('list'), /Read chapter 3/);
  assert.match(homework('list', '--all'), /\[x\] Read chapter 3/);
  homework('remove', '2');
  assert.equal(homework('list'), 'Nothing to do!');
});

test('an unknown command shows the help', () => {
  assert.match(homework('dance'), /Usage:/);
});

test('stats shows the progress', () => {
  assert.equal(homework('stats'), '0 of 0 tasks done (0%)');
  homework('add', 'Essay', '--subject', 'english');
  homework('add', 'Equations', '--subject', 'maths');
  homework('done', '1');
  assert.match(homework('stats'), /1 of 2 tasks done \(50%\)\n {2}english\s+1 done, 0 to do\n {2}maths\s+0 done, 1 to do/);
});
