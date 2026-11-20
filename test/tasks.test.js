import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clearDone, completeTask, createTask, findTasks, isOverdue, listTasks, overdueTasks, removeTask, stats } from '../src/tasks.js';

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

test('createTask keeps a valid due date and refuses a bad one', () => {
  assert.equal(createTask([], 'Essay', 'english', '2026-12-01')[0].due, '2026-12-01');
  assert.equal(createTask([], 'Essay')[0].due, undefined);
  assert.throws(() => createTask([], 'Essay', 'english', '1st December'), /must look like 2026-12-01/);
  assert.throws(() => createTask([], 'Essay', 'english', '2026-13-45'), /must look like/);
});

test('overdue tasks are the unfinished ones due before today, oldest first', () => {
  let list = createTask([], 'Late essay', 'english', '2026-11-01');
  list = createTask(list, 'Very late maths', 'maths', '2026-10-15');
  list = createTask(list, 'Future project', 'science', '2026-12-20');
  list = createTask(list, 'No date');
  list = createTask(list, 'Done but late', 'art', '2026-10-01');
  list = completeTask(list, 5);
  assert.deepEqual(overdueTasks(list, '2026-11-20').map((t) => t.title), ['Very late maths', 'Late essay']);
  assert.equal(isOverdue(list[2], '2026-11-20'), false);
  assert.equal(isOverdue(list[0], '2026-11-01'), false, 'due today is not late yet');
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

test('findTasks searches the title and the subject, ignoring case', () => {
  let list = createTask([], 'Read chapter 3', 'english');
  list = createTask(list, 'Essay on Romeo and Juliet', 'English');
  list = createTask(list, 'Equations', 'maths');
  assert.deepEqual(findTasks(list, 'ENGLISH').map((t) => t.id), [1, 2]);
  assert.deepEqual(findTasks(list, 'equa').map((t) => t.id), [3]);
  assert.deepEqual(findTasks(list, 'history'), []);
  assert.throws(() => findTasks(list, '  '), /what to look for/);
});

test('clearDone deletes the finished tasks and keeps the others', () => {
  let list = createTask(createTask(createTask([], 'A'), 'B'), 'C');
  list = completeTask(completeTask(list, 1), 3);
  assert.deepEqual(clearDone(list).map((t) => t.title), ['B']);
  assert.deepEqual(clearDone([]), []);
});
