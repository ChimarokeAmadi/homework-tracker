import { test } from 'node:test';
import assert from 'node:assert/strict';
import { completeTask, createTask, listTasks, removeTask, stats } from '../src/tasks.js';

test('createTask adds a task with the next id', () => {
  let list = createTask([], 'Read chapter 3', 'english');
  list = createTask(list, 'Maths exercises 1-10', 'maths');
  assert.deepEqual(list.map((t) => t.id), [1, 2]);
  assert.equal(list[1].subject, 'maths');
  assert.equal(list[1].done, false);
});

test('createTask trims the title and refuses an empty one', () => {
  assert.equal(createTask([], '  Essay  ')[0].title, 'Essay');
  assert.throws(() => createTask([], '   '), /needs a title/);
});

test('createTask uses "general" when there is no subject', () => {
  assert.equal(createTask([], 'Revise')[0].subject, 'general');
});

test('ids are never reused after a removal', () => {
  let list = createTask(createTask([], 'A'), 'B');
  list = removeTask(list, 1);
  list = createTask(list, 'C');
  assert.deepEqual(list.map((t) => t.id), [2, 3]);
});

test('createTask does not change the original list', () => {
  const original = [];
  createTask(original, 'A');
  assert.equal(original.length, 0);
});

test('completeTask marks one task as done', () => {
  const list = completeTask(createTask(createTask([], 'A'), 'B'), 2);
  assert.deepEqual(list.map((t) => t.done), [false, true]);
});

test('completeTask and removeTask fail for an unknown id', () => {
  const list = createTask([], 'A');
  assert.throws(() => completeTask(list, 99), /No task with id 99/);
  assert.throws(() => removeTask(list, 99), /No task with id 99/);
});

test('listTasks hides finished tasks unless asked', () => {
  const list = completeTask(createTask(createTask([], 'A'), 'B'), 1);
  assert.deepEqual(listTasks(list).map((t) => t.title), ['B']);
  assert.equal(listTasks(list, true).length, 2);
});

test('stats counts done and to-do tasks, per subject', () => {
  let list = createTask([], 'Essay', 'english');
  list = createTask(list, 'Poem', 'english');
  list = createTask(list, 'Equations', 'maths');
  list = completeTask(list, 1);
  assert.deepEqual(stats(list), {
    total: 3,
    done: 1,
    todo: 2,
    bySubject: { english: { done: 1, todo: 1 }, maths: { done: 0, todo: 1 } },
  });
  assert.deepEqual(stats([]), { total: 0, done: 0, todo: 0, bySubject: {} });
});
