// "Build" check: runs the app the way a user would (a real `node src/cli.js`
// process) and fails if any command crashes or prints something unexpected.
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const env = { ...process.env, HOMEWORK_FILE: join(mkdtempSync(join(tmpdir(), 'homework-')), 'homework.json') };
const homework = (...args) => execFileSync(process.execPath, ['src/cli.js', ...args], { env, encoding: 'utf8' });

const steps = [
  [['add', 'Smoke test task', '--subject', 'ci'], /Added:/],
  [['list'], /Smoke test task \(ci\)/],
  [['done', '1'], /Well done!/],
  [['list', '--all'], /\[x\] Smoke test task/],
  [['remove', '1'], /Removed\./],
  [['list'], /Nothing to do!/],
  [['help'], /Usage:/],
];
for (const [args, expected] of steps) {
  const output = homework(...args);
  if (!expected.test(output)) {
    console.error(`FAILED: homework ${args.join(' ')}\nexpected ${expected}, got:\n${output}`);
    process.exit(1);
  }
  console.log(`ok  homework ${args.join(' ')}`);
}
console.log('The app runs correctly.');
