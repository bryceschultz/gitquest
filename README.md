# GitQuest

A browser-based, gamified Git-learning application for beginner developers and students. Learners progress through a cyber-defense story, **Operation Shadow Breach**, by reading short tutorials and entering Git commands into a simulated terminal-style practice field, with immediate feedback, hints, retries, scored assessments, locally persisted progress, and achievements.

GitQuest is a **simulation**: it never executes Git against a real repository. All behavior is driven by controlled lesson data.

## Repository layout

| Path | What it is |
|---|---|
| `gitquest-ui/` | The application (React 19 + Vite). **Start here.** Its README covers setup, architecture, curriculum, testing, and deployment. |
| `tests/` | A small standalone TypeScript command-parser spike with its own Jest setup. Kept as a passing historical prototype; it is **not** the authoritative test suite. The authoritative tests live in `gitquest-ui/tests/`. |

## Quick start

```bash
cd gitquest-ui
npm ci
npm run dev      # local development server
npm run test     # authoritative Jest suite
npm run build    # production build
npm run lint     # ESLint (must be clean)
npm run deploy   # publish dist/ to GitHub Pages
```

The parser spike, if needed:

```bash
cd tests
npm ci
npm run test
```

## Current status

Build clean · lint 0 errors · **89/89 automated tests** (8 suites) plus 3 in the parser spike. The app is feature-complete for the demo: 4 workflow missions (36 units incl. 4 sequential Field Assignments), onboarding modes with a placement quiz, structured command validation, scoring, persisted progress with export/import/reset, achievements, and the arsenal. Outstanding: cross-browser manual pass (Chrome/Firefox/Safari) and hosting the deployed build.

## Key decisions

- **Simulation, not a Git emulator** — validation is data-driven per lesson (accept variants + reject rules + diagnostics), matching the SFS "simulation with controlled lesson data" constraint and keeping content authorable.
- **The scored command battle is the per-lesson assessment** satisfying FR-06; the placement quiz covers the classic multiple-choice form.
- **Workflow-first curriculum** — Missions are grouped by real workflow (Daily Loop → Damage Control → Parallel Operations → Ghost Protocol) in frequency order, with Assignment sub-groups and a sequential Field Assignment finale per mission.
- **Arsenal is deliberately partial** — two items have real effects (Auto-hint, Ghost Command); cosmetics are labeled prototypes in-app.
- The `tests/` parser spike is kept as a passing historical prototype; `gitquest-ui/tests/` is authoritative.

## Remaining work

Cross-browser manual pass · deploy to GitHub Pages (wired via `npm run deploy`) · CI to run tests and publish results automatically on PRs (follow-on ticket — replaces committed test-report markdown) · future scope: repo graph (FR-10), full arsenal economy, accounts/sync.

## Documentation map

- This README — project state, requirements traceability, decisions, remaining work.
- `gitquest-ui/README.md` — application internals: setup, architecture, curriculum, scoring, testing, deployment.
