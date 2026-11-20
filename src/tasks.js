// The homework list: plain functions that take a list and return a new one.

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function createTask(list, title, subject, due) {
  const cleanTitle = title.trim();
  if (cleanTitle === '') {
    throw new Error('A task needs a title');
  }
  if (due !== undefined && (!DATE.test(due) || Number.isNaN(Date.parse(due)))) {
    throw new Error(`The due date must look like 2026-12-01, not "${due}"`);
  }
  let id = 1;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id >= id) id = list[i].id + 1;
  }
  const task = { id: id, title: cleanTitle, subject: subject || 'general', done: false };
  if (due) task.due = due;
  return [...list, task];
}

export function completeTask(list, id) {
  let found = false;
  const result = list.map((task) => {
    if (task.id === id) {
      found = true;
      return { ...task, done: true };
    }
    return task;
  });
  if (!found) throw new Error(`No task with id ${id}`);
  return result;
}

export function removeTask(list, id) {
  const result = list.filter((task) => task.id !== id);
  if (result.length === list.length) throw new Error(`No task with id ${id}`);
  return result;
}

export function listTasks(list, showDone) {
  if (showDone) return list;
  return list.filter((task) => !task.done);
}
