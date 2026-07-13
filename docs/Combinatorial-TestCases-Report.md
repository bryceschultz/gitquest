# GitQuest Combinatorial Test Report

## Executive Summary

This report documents the pairwise/combinatorial test design for `gitquest-ui` battle input validation in `TrainingPage.jsx`.

- Targeted component: `gitquest-ui/src/components/TrainingPage.jsx`
- Existing test implementation: `gitquest-ui/tests/TrainingPage.test.jsx`
- Pairwise reduction result: 32 raw combinations reduced to 8 representative cases
- Verified test status: 1 suite passed, 8 tests passed
- Coverage for `TrainingPage.jsx`: 88.88% statements, 88.46% branches, 82.35% functions, 90% lines

To run the test cases : npm test -- --runInBand --testPathPatterns='TrainingPage.test.jsx'

## Scope and Objectives

The objective is to cover the `TrainingPage` battle command flow using representative cases across the main dimensions that affect behavior.

Dimensions considered:
- `input`:
  - `empty`
  - `incorrect`
  - `correct`
  - `correct_ws` (correct command with surrounding whitespace)
- `method`:
  - `click`
  - `enter`
- `attempts`:
  - `first`
  - `after_fail`
- `hint`:
  - `hint`
  - `no_hint`

This yields 32 possible raw combinations. The pairwise reduction algorithm selected 8 cases that cover every two-way interaction among these dimensions.

## Pairwise Case Summary

The selected 8 cases are documented in `Allpairs-cases.txt` and exercised in `gitquest-ui/tests/TrainingPage.test.jsx`.

Selected cases:
1. `input=empty`, `method=click`, `attempts=first`, `hint=hint`
2. `input=empty`, `method=enter`, `attempts=after_fail`, `hint=no_hint`
3. `input=incorrect`, `method=click`, `attempts=first`, `hint=no_hint`
4. `input=incorrect`, `method=enter`, `attempts=after_fail`, `hint=hint`
5. `input=correct`, `method=click`, `attempts=after_fail`, `hint=hint`
6. `input=correct`, `method=enter`, `attempts=first`, `hint=no_hint`
7. `input=correct_ws`, `method=click`, `attempts=first`, `hint=hint`
8. `input=correct_ws`, `method=enter`, `attempts=after_fail`, `hint=no_hint`

## Selected Pairwise Cases with Purpose

| Case | Input | Method | Attempt | Hint | Purpose |
|---|---|---|---|---|---|
| 1 | empty | click | first | hint | Validate initial empty command state and disabled execute with hint available |
| 2 | empty | enter | after_fail | no_hint | Verify retry flow and no hint reveal when hint is absent |
| 3 | incorrect | click | first | no_hint | Confirm wrong command rejection on first try without hint |
| 4 | incorrect | enter | after_fail | hint | Confirm rejection then retry reveals hint when hint exists |
| 5 | correct | click | after_fail | hint | Cover failure then success flow, hint reveal, and completion callback |
| 6 | correct | enter | first | no_hint | Cover direct success with Enter submission and no hint flow |
| 7 | correct_ws | click | first | hint | Validate whitespace trimming on first-attempt correct command |
| 8 | correct_ws | enter | after_fail | no_hint | Validate retry success with whitespace input and no hint |

## Test Case Mapping and Rationale

Each case targets a distinct combination of battle flow behavior.

- Cases 1 and 2 validate `empty` input behavior, including disabled execution and retry behavior with/without hints.
- Cases 3 and 4 validate wrong commands and the retry-triggered hint reveal.
- Cases 5 and 6 verify successful battle completion paths with both click and Enter submission, with/without hints.
- Cases 7 and 8 validate whitespace trimming in successful commands and the retry path when whitespace is present.

## Detailed Cases

### Positive Case

**Case 5: `correct` + `click` + `after_fail` + `hint`**

- Start with a wrong command on the first attempt
- Click `Execute`
- Receive reject feedback and `Retry`
- Click `Retry`
- Enter the correct command `git pull`
- Click `Execute`
- Confirm `✓ COMMAND ACCEPTED` is shown
- Advance timers by `1200ms`
- Confirm `Continue ▶` appears
- Click `Continue ▶`
- Confirm the `onComplete` callback is called exactly once

This case covers:
- failure + retry flow
- hint reveal on retry
- correct command acceptance
- final completion callback after the timed success state

### Negative Case

**Case 3: `incorrect` + `click` + `first` + `no_hint`**

- Enter a wrong command like `git status`
- Click `Execute`
- Confirm reject feedback appears
- Confirm no hint is shown
- Confirm `onComplete` is not called

This case covers:
- incorrect command handling
- first-attempt rejection behavior
- no-hint path without a retry or success path

## Validation Results

Run command:

```bash
cd gitquest-ui && npm test -- --coverage --runInBand --testPathPatterns='(WelcomeScreen|TrainingPage).test.jsx'
```

Results:
- Test Suites: `1 passed`
- Tests: `8 passed`
- Coverage: `TrainingPage.jsx` at `88.88%` statements, `88.46%` branches, `82.35%` functions, `90%` lines

## Recommendations

- Keep `TrainingPage` battle flow test coverage focused on the pairwise-selected cases.
- Add additional cases only if new battle dimensions are introduced, such as additional input normalization rules or alternative command submission flows.
- Extend the same pairwise approach to other components with multiple independent dimensions, such as `Arsenal` filtering/purchase logic or `MissionMap` unlock/level-selection behavior.

## Files Created / Updated

- `Combinatorial-Test-Report.md`
- `Allpairs-cases.txt`
- `Allpairs-explanation.txt`
- `gitquest-ui/tests/TrainingPage.test.jsx`

## Notes

The report is based on the current repository state and existing Jest coverage output. The `TrainingPage` test file exercises the core command validation flow and the pairwise test case set.
