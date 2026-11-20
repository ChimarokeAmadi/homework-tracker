# Part 1: version control with Git

This is how the project was built, step by step, with the Git commands used. The full history is in the repository: run `git log --graph --oneline --all` or open **Insights → Network** on GitHub.

## 1. Start a repository and make commits

```bash
git init -b main                # new repository, main branch
git add -A                      # stage every change
git commit -m "Start homework tracker: add, list, complete and remove tasks"
```

Each commit does **one thing** and its message says what changed:

| Commit | What it does |
|---|---|
| Start homework tracker | first version of the app |
| Add unit tests | 12 tests for the tasks, the file storage and the commands |
| Add ESLint | the linter config, plus its first report (31 problems) saved in `lint-before.txt` |
| Fix the 31 problems ESLint found | the code after the linter's advice |
| Add CI pipeline | the GitHub Actions workflow and the pull request template |

## 2. Branches for new features

Two features were built at the same time, each on its own branch starting from `main`. Neither could break the other or `main` while it was being written:

```bash
git switch -c feature/due-dates main      # due dates + "overdue" command (2 commits)
git switch -c feature/stats main          # "stats" command (1 commit)
```

Then both were merged back into `main`. `--no-ff` keeps a merge commit, so the history shows that these commits were a feature branch:

```bash
git switch main
git merge --no-ff feature/due-dates       # no conflict
git merge --no-ff feature/stats           # CONFLICT
```

```
*   Merge branch 'feature/stats'
|\
| * Add stats command: progress in total and per subject
* |   Merge branch 'feature/due-dates'
|\ \
| |/
|/|
| * Add overdue command and mark late tasks in the list
| * Add optional due dates to tasks (--due YYYY-MM-DD)
|/
* Add CI pipeline (GitHub Actions): lint, tests on Node 20 and 22, build, report
```

## 3. Resolving a merge conflict

Both branches added a new command at the same place, so Git couldn't decide alone, and stopped with conflicts in 5 files:

```
CONFLICT (content): Merge conflict in README.md
CONFLICT (content): Merge conflict in src/cli.js
CONFLICT (content): Merge conflict in src/tasks.js
CONFLICT (content): Merge conflict in test/cli.test.js
CONFLICT (content): Merge conflict in test/tasks.test.js
```

In the files, Git marks the two versions: `HEAD` is what's already on `main`, and the other side is the branch being merged.

```
  homework remove <id>                           delete a task
<<<<<<< HEAD
  homework overdue                               show the tasks that are late
=======
  homework stats                                 how much is done, per subject
>>>>>>> feature/stats
  homework help                                  show this help`;
```

Here the right answer was **both lines**. But "accept both" isn't always that simple. In `src/tasks.js`, both sides added a new function just before the same closing `}`. Keeping both sides as they were would have left the first function without its closing brace, so I added it. The import lines needed the names from both sides combined into one line.

After editing, I checked that everything still worked **before** finishing the merge, then deleted the merged branches:

```bash
npm run lint && npm test && npm run smoke    # 17 tests pass
git add -A
git commit                                   # the merge commit explains what was resolved
git branch -d feature/due-dates feature/stats
```

## 4. Push to GitHub

```bash
git remote add origin https://github.com/ChimarokeAmadi/homework-tracker.git
git push -u origin main
git push origin feature/search fix/cli-entry-point feature/clear-done
```

## 5. Pull changes made by someone else

When a teammate pushes, or someone edits a file directly on GitHub, your copy is behind. `git pull` brings their commits in:

```bash
git pull                     # fetch + merge origin/main into my main
git log --oneline -3         # their commit is now in my history
```

If we both changed the same lines, `git pull` stops with a conflict exactly like in section 3. You fix it the same way, then `git add` and `git commit`.

## 6. Pull requests on GitHub

The last three branches are merged through **pull requests** instead of `git merge`:

1. Push the branch and click **Compare & pull request** on GitHub.
2. CI runs automatically and shows its result in the pull request.
3. Review the changes (**Files changed** tab) and leave comments, using the checklist in the PR template.
4. Merge only when CI is green. With branch protection on (Settings → Branches → require status checks), GitHub doesn't even allow merging a red pull request.
5. Delete the branch (GitHub offers a button), then `git pull` on `main` locally.

The reviews are summarised in [QA-REPORT.md](QA-REPORT.md).
