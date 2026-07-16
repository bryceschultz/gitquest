# GitQuest UI

The GitQuest application: a React 19 + Vite single-page app that teaches practical Git through **Operation Shadow Breach** — interactive tutorials, a simulated command battle field, scored assessments, a mission map with unlock rules, local persistence, achievements, and a small arsenal economy.

GitQuest is a **simulation** (per the SFS MVP constraint): no Git commands are executed against a real repository; every behavior is driven by controlled lesson data. There is no sign-in — learners start as guests and progress is saved in the browser (`localStorage`).

## Setup and scripts

Requires Node ≥ 22.

```bash
npm ci           # install exact locked dependencies
npm run dev      # Vite dev server
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint — must pass with zero errors
npm run test     # Jest + Testing Library suite (authoritative tests)
npm run deploy   # build and publish dist/ to GitHub Pages (gh-pages)
```

## Learner routes (onboarding)

The Welcome screen choice is persisted into progress state (`progress.mode`) and drives real behavior:

- **New recruit (`new`)** — guided, strictly sequential. A lesson unlocks only when every lesson before it (in the canonical mission order) is complete. Completed lessons always remain replayable. This is also the safe default when no mode is saved.
- **Field agent (`vet`)** — free navigation across all missions. First-time field agents are offered a **placement assessment**: 8 scored multiple-choice questions with explanations for wrong answers. Scoring **≥ 75%** recommends starting at Level 2 (Mission 3); the result is stored and shown on the map. Placement is skippable and is a recommendation — field agents keep free navigation either way.

## Curriculum

| Mission | Workflow theme | Assignments → commands |
|---|---|---|
| **M1 — First Contact: The Daily Loop** (easy) | The commands you run every day | 1.1 Get the Intel: `clone`, `pull`, `status` · 1.2 Report In: `add`, `commit -m`, `push` · ⚔ FA: the full loop in sequence |
| **M2 — Damage Control: Reading & Undoing** (med) | Inspect, then choose the right undo | 2.1 Inspect the Evidence: `log`, `diff` · 2.2 The Undo Ladder: `--amend`, `restore`, `revert`, `reset --hard` · ⚔ FA: diagnose + undo an incident |
| **M3 — Parallel Operations: Branching & Integration** (med) | Work in parallel, integrate deliberately | 3.1 Open a Covert Thread: `branch`, `checkout`, `stash`, `stash pop` · 3.2 Reunify: `fetch`, `branch -a`, `merge` (+ PR note), `rebase`, `branch -d` · ⚔ FA: the feature-branch workflow |
| **M4 — Ghost Protocol: History Surgery & Shipping** (hard) | Rewrite, recover, release | 4.1 Rewrite the Record: `cherry-pick`, `merge --squash`, `rebase -i`, `push --force-with-lease` · 4.2 Search & Recover: `bisect start/good`, `reflog`, `stash branch` · 4.3 Seal the Vault: `tag`, `commit -S`, `archive` · ⚔ FA: the finale |

**36 units total: 32 single-command lessons + 4 Field Assignments** (multi-step sequential battles that compose each mission's commands — the sequence engine validates each step independently and names the failed step). Each mission ends with its storyline celebration; finishing M4 shows the Director's operation-complete message. Ordering is frequency-first: the daily loop comes before everything, and each Assignment groups commands that genuinely travel together (e.g. the Undo Ladder is taught as one unit, ordered by blast radius).

## Command validation (`src/game/validateCommand.js`)

Battles are validated by a structured, data-driven engine — not raw string equality:

- Whitespace is normalized and smart quotes are straightened, so learners aren't failed for invisible differences.
- Each lesson's `battle` may define `accept` (documented correct variants, e.g. `git switch` for `git checkout`, any-message commits via the `<message>` placeholder) and `reject` (known dangerous/typo variants with targeted teaching messages, e.g. `git push --force`).
- Anything else gets a **diagnostic**: empty input, not a Git command, capitalization mistakes, wrong subcommand, missing/extra arguments, wrong flag (with a spelling nudge for near-misses), wrong file/branch/URL target, or wrong commit message.

## Assessment scoring (the quiz mechanism)

The command battle is the per-lesson assessment (a project decision, recorded in the root README). Each battle is scored: **100** minus **25 per wrong attempt** minus **10 if the hint was revealed**, floored at **25**. The capstone's score is the average of its step scores. Best scores are persisted per lesson and aggregated in the Trophy Room. The placement quiz provides classic scored multiple-choice with wrong-answer explanations.

**Hint policy:** after one wrong attempt a "reveal hint" button appears; after two wrong attempts the hint reveals automatically. (The Auto-hint arsenal module reveals it after the first wrong attempt.)

## Progress, persistence, and achievements

`src/context/ProgressContext.jsx` owns all durable state under the `localStorage` key `gitquest-progress`: completed lessons, best scores, mode, placement result, hints used, achievements (with earn dates), arsenal inventory, and spent coins. It auto-saves on every change and tolerates corrupt/absent storage. The map provides **export** (JSON download), **import** (validated; malformed files are refused with a message), and **reset** (with confirmation).

Achievements (`src/game/achievements.js`) are pure predicates over progress, evaluated on every state change, and **monotone** — once earned, a badge keeps its date. The Trophy Room and every progress bar/coin display render **only derived state** (`src/game/stats.js`); no game value in the UI is hard-coded.

Coins: +10 per completed lesson, +25 bonus per completed mission. The Arsenal persists purchases; the two "tools" items have real gameplay effects (auto-hint, ghost command), and the cosmetic items say explicitly that they are prototypes.

## Architecture

```text
src/
├── App.jsx                    # screen routing inside ProgressProvider; mode → behavior
├── components/
│   ├── WelcomeScreen.jsx      # New recruit / Field agent selection
│   ├── PlacementQuiz.jsx      # scored placement assessment (field agents)
│   ├── MissionMap.jsx         # derived map, unlock states, data controls
│   ├── TrainingPage.jsx       # tutorial + battle field (single & sequence battles)
│   ├── Arsenal.jsx            # persisted purchases, derived balance
│   └── TrophyRoom.jsx         # derived achievements and field record
├── context/
│   ├── context.js             # context object + default progress schema
│   ├── ProgressContext.jsx    # provider: persistence + all state transitions
│   └── useProgress.js         # hook
├── game/                      # pure, unit-tested logic (no React)
│   ├── validateCommand.js     # structured command validation
│   ├── unlocks.js             # mode-aware sequential unlock rules
│   ├── stats.js               # every derived number in the UI
│   ├── achievements.js        # badge definitions and earn rules
│   └── placement.js           # placement questions + scoring
└── missions/                  # controlled lesson data (M1–M5)
```

## Testing

`npm run test` runs the authoritative Jest + Testing Library suite in `tests/` (jsdom): unit tests for the validator, unlock rules, stats, achievements, and placement scoring, plus integration tests for `ProgressContext` (persistence, hydration, guarded purchases, reset), `TrainingPage` (correct/incorrect/empty paths, hint timing, scoring, lesson-specific rejections, Field Assignment sequences), and app-shell routing. Coverage and results are self-documenting — run the suite rather than trusting a report.

**Planned improvements:** a GitHub Actions workflow to run build + lint + tests on every PR and publish results automatically (tracked as a follow-on ticket), and a manual cross-browser pass (Chrome/Firefox/Safari) before release.

## Deployment

`npm run deploy` builds and publishes `dist/` to GitHub Pages. `vite.config.js` sets `base: '/gitquest/'`; if the repository name changes, update that base path.
