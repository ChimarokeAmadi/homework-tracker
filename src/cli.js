#!/usr/bin/env node
// homework add "Read chapter 3" --subject english
// homework list [--all]
// homework done 2
// homework remove 2
import { completeTask, createTask, findTasks, isOverdue, listTasks, overdueTasks, removeTask, stats } from './tasks.js';
import { load, save } from './storage.js';

const HELP = `Usage:
  homework add "<title>" [--subject <subject>] [--due YYYY-MM-DD]   add a task
  homework list [--all]                          show tasks (--all includes finished ones)
  homework done <id>                             mark a task as finished
  homework remove <id>                           delete a task
  homework overdue                               show the tasks that are late
  homework stats                                 how much is done, per subject
  homework find <word>                           search titles and subjects
  homework help                                  show this help`;

function option(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
}

function show(task) {
  const box = task.done ? '[x]' : '[ ]';
  const due = task.due ? ` due ${task.due}${isOverdue(task) ? ' (LATE!)' : ''}` : '';
  return `${String(task.id).padStart(3)} ${box} ${task.title} (${task.subject})${due}`;
}

export function run(args, print = console.log) {
  const command = args[0];
  let list = load();
  if (command === 'add') {
    list = createTask(list, args[1] || '', option(args, '--subject'), option(args, '--due'));
    save(list);
    print(`Added: ${show(list[list.length - 1])}`);
  } else if (command === 'list') {
    const tasks = listTasks(list, args.includes('--all'));
    if (tasks.length === 0) print('Nothing to do!');
    tasks.forEach((t) => print(show(t)));
  } else if (command === 'done') {
    save(completeTask(list, Number(args[1])));
    print('Well done!');
  } else if (command === 'remove') {
    save(removeTask(list, Number(args[1])));
    print('Removed.');
  } else if (command === 'overdue') {
    const late = overdueTasks(list);
    if (late.length === 0) print('Nothing is late. Nice!');
    late.forEach((t) => print(show(t)));
  } else if (command === 'stats') {
    const s = stats(list);
    const percent = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100);
    print(`${s.done} of ${s.total} tasks done (${percent}%)`);
    for (const [subject, count] of Object.entries(s.bySubject)) {
      print(`  ${subject.padEnd(12)} ${count.done} done, ${count.todo} to do`);
    }
  } else if (command === 'find') {
    const found = findTasks(list, args[1]);
    if (found.length === 0) print(`No task matches "${args[1]}".`);
    found.forEach((t) => print(show(t)));
  } else {
    print(HELP);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    run(process.argv.slice(2));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  }
}
