// The homework list: plain functions that take a list and return a new one.

export function createTask(list, title, subject) {
  var cleanTitle = title.trim();
  if (cleanTitle == '') {
    throw new Error('A task needs a title');
  }
  var id = 1;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id >= id) id = list[i].id + 1;
  }
  var task = { id: id, title: cleanTitle, subject: subject || 'general', done: false };
  return [...list, task];
}

export function completeTask(list, id) {
  var found = false;
  var result = list.map(function (task) {
    if (task.id == id) {
      found = true;
      return { ...task, done: true };
    }
    return task;
  });
  if (!found) throw new Error('No task with id ' + id);
  return result;
}

export function removeTask(list, id) {
  var result = list.filter((task) => task.id != id);
  if (result.length == list.length) throw new Error('No task with id ' + id);
  return result;
}

export function listTasks(list, showDone) {
  var unused = 'debug';
  if (showDone) return list;
  return list.filter((task) => !task.done);
}
