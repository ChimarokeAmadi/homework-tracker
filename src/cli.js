#!/usr/bin/env node
// homework add "Read chapter 3" --subject english
// homework list [--all]
// homework done 2
// homework remove 2
import { completeTask, createTask, listTasks, removeTask } from './tasks.js';
import { load, save } from './storage.js';

const HELP = `Usage:
  homework add "<title>" [--subject <subject>]   add a task
  homework list [--all]                          show tasks (--all includes finished ones)
  homework done <id>                             mark a task as finished
  homework remove <id>                           delete a task
  homework help                                  show this help`;

function option(args, name) {
  var i = args.indexOf(name);
  if (i == -1) return undefined;
  return args[i + 1];
}

function show(task) {
  var box = task.done ? '[x]' : '[ ]';
  return `${String(task.id).padStart(3)} ${box} ${task.title} (${task.subject})`;
}

export function run(args, print = console.log) {
  var command = args[0];
  var list = load();
  if (command == 'add') {
    list = createTask(list, args[1] || '', option(args, '--subject'));
    save(list);
    print('Added: ' + show(list[list.length - 1]));
  } else if (command == 'list') {
    var tasks = listTasks(list, args.includes('--all'));
    if (tasks.length == 0) print('Nothing to do!');
    tasks.forEach((t) => print(show(t)));
  } else if (command == 'done') {
    save(completeTask(list, Number(args[1])));
    print('Well done!');
  } else if (command == 'remove') {
    save(removeTask(list, Number(args[1])));
    print('Removed.');
  } else {
    print(HELP);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    run(process.argv.slice(2));
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exitCode = 1;
  }
}
