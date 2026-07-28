// Placement assessment for the Field Agent onboarding path (FR-06, S3-02).
//
// PLACEMENT_QUESTION_BANK is the full pool of git-knowledge questions.
// Each attempt draws a random subset via getPlacementSet() — grow the bank
// over time and every attempt keeps sampling from whatever is here.
//
// Scoring is always done against the specific subset that was actually
// shown (scorePlacement takes the questions array, not the full bank),
// since which questions were asked changes attempt to attempt.
//
// Score maps to a recommended starting level:
//   0–49%  → Level 1
//   50–74% → Level 2
//   75–100%→ Level 3
// This is a recommendation only — Field Agents get free-roam access to
// every mission regardless of score (see MissionMap.jsx).

export const PLACEMENT_QUESTION_COUNT = 10

export const PLACEMENT_QUESTION_BANK = [
    {
        id: 'p01',
        prompt: 'Which command creates a new branch called "feature" and switches to it in a single step?',
        choices: ['git branch feature', 'git switch -c feature', 'git checkout feature', 'git merge feature'],
        answer: 1,
        explanation: 'git switch -c creates and checks out a new branch in one command. git branch alone only creates it, without switching to it.',
    },
    {
        id: 'p02',
        prompt: 'Which command shows the commit history of the current branch?',
        choices: ['git status', 'git log', 'git show', 'git diff'],
        answer: 1,
        explanation: 'git log lists the commit history. git status shows working-directory state, git diff shows unstaged changes, and git show displays a single commit.',
    },
    {
        id: 'p03',
        prompt: 'Which command stages a file for the next commit?',
        choices: ['git add', 'git commit', 'git stage', 'git track'],
        answer: 0,
        explanation: 'git add moves changes from the working directory into the staging area, ready to be committed.',
    },
    {
        id: 'p04',
        prompt: 'Which command combines the changes from one branch into your current branch, preserving both histories?',
        choices: ['git rebase', 'git cherry-pick', 'git merge', 'git fetch'],
        answer: 2,
        explanation: 'git merge integrates another branch into the current one, creating a merge commit that preserves both histories.',
    },
    {
        id: 'p05',
        prompt: 'Which command temporarily shelves uncommitted changes so you can switch branches cleanly?',
        choices: ['git stash', 'git reset', 'git clean', 'git hold'],
        answer: 0,
        explanation: 'git stash saves your uncommitted changes on a stack and reverts the working directory, letting you switch context safely.',
    },
    {
        id: 'p06',
        prompt: 'Which command downloads commits from a remote but does NOT merge them into your current branch?',
        choices: ['git pull', 'git fetch', 'git clone', 'git push'],
        answer: 1,
        explanation: 'git fetch retrieves remote history without touching your working branch. git pull is effectively fetch + merge.',
    },
    {
        id: 'p07',
        prompt: 'Which file tells Git which files or folders to ignore when tracking changes?',
        choices: ['.gitconfig', '.gitignore', '.gitattributes', '.gitkeep'],
        answer: 1,
        explanation: '.gitignore lists patterns for files Git should never track or stage, like build output or node_modules.',
    },
    {
        id: 'p08',
        prompt: 'Which command uploads your local commits to a remote repository?',
        choices: ['git push', 'git send', 'git upload', 'git commit --remote'],
        answer: 0,
        explanation: 'git push sends your local commits to the specified remote branch.',
    },
    {
        id: 'p09',
        prompt: 'You want to undo the last commit but keep its changes in your working directory. Which command does this?',
        choices: ['git reset --soft HEAD~1', 'git revert HEAD', 'git checkout HEAD~1', 'git clean -f'],
        answer: 0,
        explanation: 'git reset --soft HEAD~1 moves the branch pointer back one commit while leaving the changes staged in your working directory.',
    },
    {
        id: 'p10',
        prompt: 'Which command creates a new commit that undoes the changes of a previous commit, without rewriting history?',
        choices: ['git reset', 'git revert', 'git rebase', 'git checkout'],
        answer: 1,
        explanation: 'git revert adds a new commit that inverts a prior commit\'s changes, which is safe on shared/public branches since it never rewrites history.',
    },
    {
        id: 'p11',
        prompt: 'Which command lets you copy a single specific commit from one branch onto another?',
        choices: ['git cherry-pick', 'git graft', 'git transplant', 'git copy-commit'],
        answer: 0,
        explanation: 'git cherry-pick applies the changes introduced by a specific commit onto your current branch.',
    },
    {
        id: 'p12',
        prompt: 'Which command initializes a brand-new, empty Git repository in the current folder?',
        choices: ['git start', 'git new', 'git init', 'git create'],
        answer: 2,
        explanation: 'git init sets up the .git directory needed to start tracking a project.',
    },
    {
        id: 'p13',
        prompt: 'Which command lets you see the exact line-by-line changes that are not yet staged?',
        choices: ['git diff', 'git log -p', 'git status', 'git blame'],
        answer: 0,
        explanation: 'git diff shows unstaged changes line by line. git log -p shows historical commit diffs, not current working changes.',
    },
    {
        id: 'p14',
        prompt: 'Which command rewrites your current branch\'s history by replaying its commits on top of another branch?',
        choices: ['git merge', 'git rebase', 'git reset', 'git squash'],
        answer: 1,
        explanation: 'git rebase moves or replays commits onto a new base commit, producing a linear history instead of a merge commit.',
    },
    {
        id: 'p15',
        prompt: 'Which command shows which lines of a file were last changed by which commit?',
        choices: ['git blame', 'git trace', 'git annotate-file', 'git history'],
        answer: 0,
        explanation: 'git blame annotates each line of a file with the commit and author that last modified it.',
    },
    {
        id: 'p16',
        prompt: 'Which command permanently deletes untracked files from your working directory?',
        choices: ['git reset --hard', 'git rm -r', 'git clean -f', 'git delete'],
        answer: 2,
        explanation: 'git clean -f removes untracked files. git reset --hard only affects tracked files already known to Git.',
    },
]

// Score tiers, checked from highest to lowest.
export const LEVEL_THRESHOLDS = [
    { minPct: 75, level: 3 },
    { minPct: 50, level: 2 },
    { minPct: 0,  level: 1 },
]

/**
 * @param {number} pct - 0 to 100
 * @returns {number} recommended starting level (1, 2, or 3)
 */
export function recommendedLevelForPct(pct) {
    const tier = LEVEL_THRESHOLDS.find(t => pct >= t.minPct)
    return tier ? tier.level : 1
}

/**
 * Draw a random subset of `count` questions from `pool`, without repeats.
 * @param {number} count
 * @param {Array} pool
 * @returns {Array}
 */
export function getPlacementSet(count = PLACEMENT_QUESTION_COUNT, pool = PLACEMENT_QUESTION_BANK) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Score a placement attempt against the specific questions that were shown.
 * @param {Array} questions - the subset of questions actually presented
 * @param {Object} answers - map of questionId -> selected choice index
 * @returns {{correct: number, total: number, pct: number, recommendedLevel: number}}
 */
export function scorePlacement(questions = [], answers = {}) {
    const total = questions.length
    let correct = 0

    for (const q of questions) {
        if (answers && answers[q.id] === q.answer) correct++
    }

    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    const recommendedLevel = recommendedLevelForPct(pct)

    return { correct, total, pct, recommendedLevel }
}