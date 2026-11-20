# Homework Tracker

[![CI](https://github.com/ChimarokeAmadi/homework-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/ChimarokeAmadi/homework-tracker/actions/workflows/ci.yml)

A small command-line app to keep track of homework. I built it for a GoMyCode checkpoint about **version control, continuous integration and quality assurance**. The app is deliberately simple, so the focus stays on the workflow around it: Git branches and merges, a CI pipeline, tests, a linter and code reviews.

| Deliverable | Where |
|---|---|
| **Version control**: branches, merges, a resolved conflict, pull requests | this repository's history, explained in [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md) |
| **CI pipeline** | [.github/workflows/ci.yml](.github/workflows/ci.yml), with runs in the [Actions tab](https://github.com/ChimarokeAmadi/homework-tracker/actions) |
| **QA report**: tests, linter findings, code reviews | [docs/QA-REPORT.md](docs/QA-REPORT.md) |
| **Reflection** | [below](#reflection) |

## Using the app

You need Node.js 20.19 or newer.

```bash
npm install
node src/cli.js add "Read chapter 3" --subject english --due 2026-12-01
node src/cli.js add "Equations 1-10" --subject maths
node src/cli.js list
node src/cli.js done 1
node src/cli.js stats
node src/cli.js help
```

The tasks are saved in `homework.json` in the current folder. You can set `HOMEWORK_FILE` to use another file.

## Checking the code

```bash
npm run lint            # ESLint
npm test                # unit tests
npm run test:coverage   # tests + coverage (Node 22+, fails under 90%)
npm run smoke           # runs the real commands like a user would
npm run check           # lint + tests + smoke, the same as CI
```

## The CI pipeline

On **every push to any branch** and on **every pull request**, GitHub Actions runs:

```
 Lint (ESLint) ──────────┐
 Unit tests (Node 20) ───┼──► Build and run the app ──► Report result
 Unit tests (Node 22) ───┘    (smoke test + npm pack)    (summary + optional Slack)
     + coverage ≥ 90%
```

- **Lint** and **tests** run in parallel. Tests run on two Node versions, because "it works on my computer" isn't enough.
- **Build** only runs if lint and tests pass. It starts the real program, runs every command, and packages the app as a downloadable artifact.
- **Notifications:**
  - **On GitHub:** a red ✗ or green ✓ on the commit and the pull request, and the badge at the top of this page.
  - **Email:** GitHub emails the person who pushed when a run fails (Settings → Notifications → Actions).
  - **Slack (optional):** if you add a Slack webhook URL as a repository secret named `SLACK_WEBHOOK_URL`, the last job also posts "✅ CI passed" or "❌ CI failed" to Slack.
- **Branch protection:** Settings → Branches → add a rule for `main` with "Require status checks to pass". A pull request with a red build can't be merged.

## Reflection

**What challenges did I face?** Git itself was familiar, but resolving a conflict properly was more subtle than I expected. Both branches added a function just before the same closing brace, so simply accepting both sides would have broken the code. CI had its own surprise: the coverage option I used doesn't exist in Node 20, so the Node 20 job would have failed on every push. I only found it because I ran the same commands locally first. ESLint's new configuration format also took some reading.

**How did the CI pipeline help?** It turned "I think it works" into a check that runs by itself on every push. When I pushed the `clear` command with a mistake, CI failed within a minute: the linter flagged an unused variable, two tests failed, and the build didn't even start. GitHub emailed me and blocked the merge. Testing on two Node versions also caught a problem I wouldn't have noticed on my own machine.

**How did version control and QA improve collaboration and quality?** Branches let two features grow at the same time without breaking `main`, and the history shows exactly what changed and why. The linter found 31 problems in my first version, which made the code safer (`===` instead of `==`) and consistent. Reviewing pull requests made me read every change again before merging. That's how I noticed that `find` only searched the first word and that the app didn't start through npm's link. Tests then made sure those bugs stay fixed.

## Features

- Add, list, complete and remove tasks, each with a subject.
- Due dates: `--due 2026-12-01` when adding, and `homework overdue` to see what's late.
- Progress: `homework stats` shows how many tasks are done, in total and per subject.
