import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { load, save } from '../src/storage.js';

const tempFile = () => join(mkdtempSync(join(tmpdir(), 'homework-')), 'homework.json');

test('load returns an empty list when the file does not exist yet', () => {
  assert.deepEqual(load(tempFile()), []);
});

test('save then load gives back the same tasks', () => {
  const file = tempFile();
  const tasks = [{ id: 1, title: 'Essay', subject: 'english', done: false }];
  save(tasks, file);
  assert.deepEqual(load(file), tasks);
});
