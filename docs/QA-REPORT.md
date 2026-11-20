# QA report

Three quality checks protect this project:
- **unit tests**, which check that the code does what it should;
- **a linter**, which checks for common mistakes and a consistent style;
- **code review** in pull requests, where a person reads the change.

All of them run, or are visible, in every pull request through the CI pipeline.

## 1. Unit tests

Written with Node's built-in test runner (`node:test`), so there's nothing extra to install. Run them with `npm test`.

**On `main`: 17 tests**

| File | Test | What it protects |
|---|---|---|
| tasks.test.js | createTask adds a task with the next id | ids start at 1 and go up |
| | createTask trims the title and refuses an empty one | no empty tasks |
| | createTask uses "general" when there is no subject | sensible default |
| | ids are never reused after a removal | `done 2` never hits the wrong task after a delete |
| | createTask does not change the original list | functions return a new list (no hidden side effects) |
| | completeTask marks one task as done | |
| | completeTask and removeTask fail for an unknown id | clear error instead of silently doing nothing |
| | listTasks hides finished tasks unless asked | |
| | createTask keeps a valid due date and refuses a bad one | rejects "1st December" and impossible dates like 2026-13-45 |
| | overdue tasks are the unfinished ones due before today, oldest first | edge cases: done tasks, no date, due *today* |
| | stats counts done and to-do tasks, per subject | including an empty list |
| storage.test.js | load returns an empty list when the file does not exist yet | first run |
| | save then load gives back the same tasks | nothing lost in the JSON file |
| cli.test.js | add, list, done and remove | the commands together, like a user |
| | an unknown command shows the help | |
| | overdue lists the late tasks | |
| | stats shows the progress | the exact output, including 0% with no tasks |

**Added by the pull requests: 7 more tests**

| Branch | Tests |
|---|---|
| feature/search | findTasks searches the title and the subject, ignoring case · find shows matching tasks |
| fix/cli-entry-point | starts directly · starts through a link, like the one npm creates for the homework command · starts from a folder with a space in its name |
| feature/clear-done | clearDone deletes the finished tasks and keeps the others · clear deletes the finished tasks |

The three `fix/cli-entry-point` tests are **regression tests**. I ran them against the old code first: 2 of them fail there, so they really catch the bug.

**Coverage:** the tests run **97%** of the lines of the app's code (`src/`). CI fails if this ever drops under 90%. CI also runs a **smoke test** (`npm run smoke`) that starts the real program as a user would and runs every command.

## 2. Linter (ESLint)

Config: [eslint.config.js](../eslint.config.js). It uses ESLint's recommended rules, plus `eqeqeq`, `no-var`, `prefer-const`, `prefer-arrow-callback`, `curly` and `prefer-template`.

**First run on the first version: 31 problems** (full output in [lint-before.txt](lint-before.txt)). I wrote the first version quickly in an older JavaScript style:

| Rule | Count | Why it matters |
|---|---|---|
| `no-var` | 14 | `var` ignores `{ }` blocks, which causes confusing bugs. `let` and `const` don't |
| `eqeqeq` | 10 | `==` converts types: `"1" == 1` is true. `===` is exact |
| `prefer-template` | 5 | `` `No task with id ${id}` `` is easier to read than `'No task with id ' + id` |
| `prefer-arrow-callback` | 1 | consistent style |
| `no-unused-vars` | 1 | a leftover `unused = 'debug'` variable: dead code |

`eslint --fix` corrected 20 of them automatically. I fixed the other 11 by hand (the `==` ones and the unused variable), because changing `==` to `===` *can* change behaviour. Here the tests showed it didn't, since the ids are always numbers. The fixer also left some odd spacing (`${  id}`), which I cleaned up. **Since then: 0 problems on `main`.**

**Caught during development:**
- On `feature/stats`, ESLint refused a test with two literal spaces in a regular expression (`no-regex-spaces`: "spaces are hard to count, use {2}"). Fixed before committing.
- On `feature/clear-done`, CI catches an unused variable (`before`, `no-unused-vars`). See section 4.

**Caught by running CI locally first:** the coverage option `--test-coverage-lines` doesn't exist in Node 20, so the Node 20 test job would have failed on every push. The pipeline now checks coverage only on Node 22.

**Caught by CI on GitHub:** pull request `fix/cli-entry-point` passed on my Mac but failed **Unit tests (Node 22)**: coverage dropped to 82.8%, under the 90% minimum. Its new test copies the app into a temporary folder to start it from a path with a space, and Node counted those copies as extra, barely tested files. The app's real code was still 94–100% covered. I fixed it by measuring coverage only for `src/` (`--test-coverage-include='src/**'`), and the pull request went green.

## 3. Code reviews

No classmate was available, so I reviewed each pull request **myself** on GitHub, using the checklist in the pull request template and leaving comments in the **Files changed** tab. Self-review is weaker than a review by someone else, because you read your own code with your own assumptions. The checklist and CI made up for some of that.

| Pull request | CI | Review comments | Outcome |
|---|---|---|---|
| **fix/cli-entry-point**: the app printed nothing when started through npm's link or from a folder with a space | ✅ | Reproduced the bug before approving: through a symlink and from "my project/", the old version printed nothing and still exited with 0. The fix compares real file paths instead of a URL, and has a test for each way of starting. Nit: the new `import` lines sit above the usage comment, so I'll move the comment in a later change. | merged |
| **feature/search**: `homework find <word>` | ✅ | Tests cover upper/lower case, no match, and an empty search. **Issue:** `homework find romeo juliet` only searches for "romeo", because the command uses `args[1]` only. Asked for `args.slice(1).join(' ')`. | merged, then fixed in follow-up PR **fix/find-all-words** (I merged before pushing the fix, so the fix went in its own small PR, with a test for a multi-word search) |
| **feature/clear-done**: `homework clear` | ❌ then ✅ | CI failed on the first push: ESLint `no-unused-vars` (`before` is never used), and 2 tests failed, because `clearDone` kept the **finished** tasks instead of the unfinished ones (`task.done` instead of `!task.done`). Fixed in a second commit. It then conflicted with `feature/search` (both add a command in the same places), so I merged the latest `main` into the branch on my computer, resolved the conflict (keeping both commands) and pushed. | fixed, conflict resolved, merged |

## 4. The CI pipeline catching a mistake

`feature/clear-done` was pushed with a deliberate mistake, to see what happens:
- The **Lint** job failed with ``'before' is assigned a value but never used``.
- The **Unit tests** jobs failed: 2 of 19 tests.
- The **Build** job didn't run, because it needs lint and tests to pass first.
- GitHub marked the commit and the pull request with a red ✗ and **emailed me** "Run failed".

After the fix, everything went green and the pull request could be merged. Without CI, this would have been found by a user who ran `homework clear` and lost their unfinished homework instead of the finished ones.
