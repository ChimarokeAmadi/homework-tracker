// The homework list: plain functions that take a list and return a new one.

export function createTask(list, title, subject) {
  const cleanTitle = title.trim();
  if (cleanTitle === '') {
    throw new Error('A task needs a title');
  }
  let id = 1;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id >= id) id = list[i].id + 1;
  }
  const task = { id: id, title: cleanTitle, subject: subject || 'general', done: false };
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
