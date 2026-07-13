# GitQuest Combinatorial Test Report

## Summary

| Item                  | Value                                                                          |
| --------------------- | ------------------------------------------------------------------------------ |
| Component under test  | `gitquest-ui/src/components/TrainingPage.jsx`                                 |
| Test file              | `gitquest-ui/tests/TrainingPage.test.jsx`                                     |
| Pairwise reduction     | 32 raw combinations → 8 representative cases                                  |
| Test status            | 1 suite passed, 8 tests passed                                                |
| Coverage               | 88.88% statements, 88.46% branches, 82.35% functions, 90% lines               |
| Run command            | `npm test -- --runInBand --testPathPatterns='TrainingPage.test.jsx'`          |

## Scope

Objective: cover the `TrainingPage` battle command flow using representative cases across the dimensions that affect behavior. 32 possible raw combinations were reduced to 8 pairwise cases covering every two-way interaction.

| Dimension  | Values                                                    |
| ---------- | ---------------------------------------------------------- |
| `input`    | `empty`, `incorrect`, `correct`, `correct_ws` (correct + whitespace) |
| `method`   | `click`, `enter`                                           |
| `attempts` | `first`, `after_fail`                                      |
| `hint`     | `hint`, `no_hint`                                          |

## Pairwise Test Cases

| # | Input       | Method | Attempt     | Hint    | Purpose                                                        |
| - | ----------- | ------ | ----------- | ------- | ---------------------------------------------------------------- |
| 1 | empty       | click  | first       | hint    | Initial empty command state; execute disabled with hint available |
| 2 | empty       | enter  | after_fail  | no_hint | Retry flow; no hint reveal when hint is absent                   |
| 3 | incorrect   | click  | first       | no_hint | Wrong command rejected on first try, no hint                     |
| 4 | incorrect   | enter  | after_fail  | hint    | Rejection then retry reveals hint                                 |
| 5 | correct     | click  | after_fail  | hint    | Failure → success flow, hint reveal, completion callback         |
| 6 | correct     | enter  | first       | no_hint | Direct success via Enter, no hint                                 |
| 7 | correct_ws  | click  | first       | hint    | Whitespace trimming on first-attempt correct command             |
| 8 | correct_ws  | enter  | after_fail  | no_hint | Retry success with whitespace input, no hint                      |

**Grouping:** Cases 1–2 cover `empty` input (disabled execution, retry with/without hint) · Cases 3–4 cover wrong commands and retry-triggered hint reveal · Cases 5–6 cover successful completion via click/Enter, with/without hints · Cases 7–8 cover whitespace trimming on first attempt and retry.

## Detailed Cases

### Positive — Case 5: `correct` + `click` + `after_fail` + `hint`

| Step | Action / Expectation                                              |
| ---- | -------------------------------------------------------------------- |
| 1    | Enter wrong command on first attempt, click `Execute`                |
| 2    | Reject feedback shown, `Retry` appears                               |
| 3    | Click `Retry`, enter correct command `git pull`                      |
| 4    | Click `Execute` → `✓ COMMAND ACCEPTED` shown                         |
| 5    | Advance timers 1200ms → `Continue ▶` appears                         |
| 6    | Click `Continue ▶` → `onComplete` called exactly once                |

Covers: failure + retry flow, hint reveal on retry, correct command acceptance, timed completion callback.

### Negative — Case 3: `incorrect` + `click` + `first` + `no_hint`

| Step | Action / Expectation                     |
| ---- | ------------------------------------------- |
| 1    | Enter wrong command (`git status`), click `Execute` |
| 2    | Reject feedback appears                     |
| 3    | No hint shown                               |
| 4    | `onComplete` not called                     |

Covers: incorrect command handling, first-attempt rejection, no-hint path with no retry/success.

## Validation Results

Run command:
```bash
cd gitquest-ui && npm test -- --coverage --runInBand --testPathPatterns='(WelcomeScreen|TrainingPage).test.jsx'
```

| Metric      | Result     |
| ----------- | ---------- |
| Test Suites | 1 passed   |
| Tests       | 8 passed   |
| Statements  | 88.88%     |
| Branches    | 88.46%     |
| Functions   | 82.35%     |
| Lines       | 90%        |

