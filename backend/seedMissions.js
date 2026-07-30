import mongoose from 'mongoose';
import dotenv   from 'dotenv';
import Level    from './models/Level.js';
import Mission  from './models/Mission.js';
import Command  from './models/Command.js';

dotenv.config();

// ── Level data ────────────────────────────────────────────────
const levels = [
    { levelNumber: 1, title: 'Recruit Training',  subtitle: 'Master the basics before field clearance is granted.', difficulty: 'beginner',     order: 1, xpReward: 100, coinReward: 50  },
    { levelNumber: 2, title: 'Deep Infiltration', subtitle: 'Coordinate threads. Correct mistakes under fire.',      difficulty: 'intermediate', order: 2, xpReward: 200, coinReward: 100 },
    { levelNumber: 3, title: 'Ghost Protocol',    subtitle: 'Surgical Git precision. One wrong command ends everything.', difficulty: 'advanced', order: 3, xpReward: 300, coinReward: 150 },
];

// Fixed identifiers referenced across missions so a chained field-assignment
// answer stays consistent with the single-command missions that taught it.
const REPO_URL       = 'https://github.com/us-cyber/shadow-breach.git';
const EVIDENCE_FILE  = 'intel-report.md';
const CORRUPTED_FILE = 'mission-log.txt';
const DECOY_BRANCH   = 'decoy-operation';
const RECOVERY_BRANCH = 'recovery-branch';
const FEATURE_BRANCH  = 'feature-branch';
const RELEASE_TAG     = 'v1.0';
const FIX_HASH        = 'a3f9c2d';
const GOOD_HASH        = 'b7e21aa';

// Escapes regex metacharacters in a literal string (used for building exact
// -match validPatterns from the fixed identifiers above).
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Mission + Command data ────────────────────────────────────
const missionData = [

    // ══════════════════════════════════════════════════════════
    // LEVEL 1 — Recruit Training
    // ══════════════════════════════════════════════════════════
    {
        mission: {
            missionNumber: 1, title: 'Mission 01 · Clone the Intelligence Repository',
            story: `Agent, headquarters has located the Shadow Breach intelligence database at ${REPO_URL}. The repository contains clues about the hackers' next target. Download it so you can begin your investigation.`,
            scenario: `HQ sends you the repository URL: ${REPO_URL}. What command downloads a full local copy, including its complete history?`,
            order: 1, xpReward: 10, coinReward: 5,
        },
        command: {
            command: `git clone ${REPO_URL}`,
            validPattern: `^git\\s+clone\\s+${esc(REPO_URL)}\\s*$`,
            caseSensitive: true,
            title: 'git clone', subtitle: 'Download a complete copy of a remote repository', difficulty: 'easy',
            about: `Agent HQ has located the Shadow Breach intelligence database. The repository contains clues about the hackers' next target, but it lives on a remote server — you need it on your own machine before you can start digging.`,
            briefing: {
                whatItDoes: { body: `git clone creates a complete copy of a remote repository on your local machine, including all files and the entire commit history. Think of it like downloading the agency's entire case file so you can work on it locally.` },
                basicSyntax: { blocks: [
                        { code: 'git clone <repository-url>', desc: 'Clone a repository into a new directory' },
                        { code: 'git clone <repository-url> <folder-name>', desc: 'Clone into a custom-named folder' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git clone ${REPO_URL}` },
                        { output: "Cloning into 'shadow-breach'...\nremote: Enumerating objects: 128, done.\nReceiving objects: 100% (128/128), done." },
                        { prompt: '$', cmd: 'cd shadow-breach', comment: '# enter the new local copy' },
                    ]},
                watchOutFor: { warnings: [
                        'Cloning downloads the full commit history, not just the latest files — large repos can take a while.',
                        'Make sure you have the correct URL; a typo will fail or clone the wrong intel.',
                    ]},
            },
            hint: `Use git clone followed by the exact repository URL: ${REPO_URL}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git clone ${REPO_URL}`, hint: `Use git clone followed by the exact repository URL: ${REPO_URL}` },
        },
    },
    {
        mission: {
            missionNumber: 2, title: 'Mission 02 · Pull the Latest Intelligence',
            story: 'Urgent message from headquarters: Shadow Breach has altered its attack strategy. Your local files are now outdated. Synchronize before proceeding.',
            scenario: 'Another agent uploaded new intelligence identifying the hackers\' next target. What command updates your local repository?',
            order: 2, xpReward: 10, coinReward: 5,
        },
        command: {
            command: 'git pull', validPattern: '^git\\s+pull(\\s+.*)?$', caseSensitive: true,
            title: 'git pull', subtitle: 'Fetch and merge changes from a remote repository', difficulty: 'easy',
            about: `A fellow agent has pushed new findings to the remote repository. Your local copy is now stale — you need the latest intel before you continue the investigation.`,
            briefing: {
                whatItDoes: { body: 'git pull downloads the latest commits from the remote repository and merges them into your current local branch in one step. It\'s effectively git fetch followed by git merge.' },
                basicSyntax: { blocks: [
                        { code: 'git pull', desc: 'Fetch and merge from the branch your local branch tracks' },
                        { code: 'git pull <remote> <branch>', desc: 'Pull explicitly from a specific remote and branch' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git pull' },
                        { output: "Updating a1b2c3d..e4f5g6h\nFast-forward\n 2 files changed, 14 insertions(+)" },
                    ]},
                watchOutFor: { warnings: [
                        'Pulling merges immediately — uncommitted local changes can cause conflicts.',
                        'If your branch has diverged from the remote, pull may create an unexpected merge commit.',
                    ]},
            },
            hint: 'Fetches and merges the latest changes from the remote into your local branch.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git pull', hint: 'Fetches and merges the latest changes from the remote into your local branch.' },
        },
    },
    {
        mission: {
            missionNumber: 3, title: 'Mission 03 · Scout the Status',
            story: 'Before filing your next report, you need to know exactly which files have been modified and which are ready to submit.',
            scenario: 'You\'ve been editing several files. What command shows which are staged, modified, or new?',
            order: 3, xpReward: 10, coinReward: 5,
        },
        command: {
            command: 'git status', validPattern: '^git\\s+status(\\s+.*)?$', caseSensitive: true,
            title: 'git status', subtitle: 'See what changed in your working directory', difficulty: 'easy',
            about: `You've been making edits across the investigation files. Before you stage or submit anything, HQ protocol requires you to confirm exactly what state your workspace is in.`,
            briefing: {
                whatItDoes: { body: 'git status shows the current state of your working directory and staging area — which files are modified, staged for the next commit, or untracked entirely.' },
                basicSyntax: { blocks: [
                        { code: 'git status', desc: 'Show the full status of tracked and untracked files' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git status' },
                        { output: "On branch main\nChanges not staged for commit:\n  modified:   intel-report.md\n\nUntracked files:\n  case-notes.txt" },
                    ]},
                watchOutFor: { warnings: [
                        'git status only reports what has changed — it doesn\'t stage or save anything by itself.',
                        'Untracked files are invisible to Git until you explicitly git add them.',
                    ]},
            },
            hint: 'Shows the state of your working directory and staging area.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git status', hint: 'Shows the state of your working directory and staging area.' },
        },
    },
    {
        mission: {
            missionNumber: 4, title: 'Mission 04 · Stage the Evidence',
            story: `You've uncovered critical evidence linking Shadow Breach to an upcoming cyberattack, written up in ${EVIDENCE_FILE}. Prepare it for submission to headquarters.`,
            scenario: `You updated ${EVIDENCE_FILE}. What command stages exactly that file for the next commit?`,
            order: 4, xpReward: 10, coinReward: 5,
        },
        command: {
            command: `git add ${EVIDENCE_FILE}`,
            validPattern: `^git\\s+add\\s+${esc(EVIDENCE_FILE)}\\s*$`,
            caseSensitive: true,
            title: 'git add', subtitle: 'Stage a file for the next commit', difficulty: 'easy',
            about: `Your findings are documented in ${EVIDENCE_FILE}. Before it can become part of the permanent case record, it needs to be staged — marked as ready for the next commit.`,
            briefing: {
                whatItDoes: { body: 'git add moves changes from your working directory into the staging area, marking them to be included in the next commit. Nothing is permanently saved yet — staging just prepares it.' },
                basicSyntax: { blocks: [
                        { code: 'git add <file>', desc: 'Stage a specific file' },
                        { code: 'git add .', desc: 'Stage every changed file in the current directory' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git add ${EVIDENCE_FILE}` },
                        { prompt: '$', cmd: 'git status', comment: '# confirm it is staged' },
                        { output: "Changes to be committed:\n  modified:   intel-report.md" },
                    ]},
                watchOutFor: { warnings: [
                        'Staging isn\'t permanent — you still need git commit to record it in history.',
                        'git add . stages everything in the directory, including files you may not have meant to include.',
                    ]},
            },
            hint: `Use git add followed by the exact filename: ${EVIDENCE_FILE}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git add ${EVIDENCE_FILE}`, hint: `Use git add followed by the exact filename: ${EVIDENCE_FILE}` },
        },
    },
    {
        mission: {
            missionNumber: 5, title: 'Field Assignment 1 · Full Intake Protocol',
            story: `A new lead just came in. Execute the agency's standard intake protocol on ${REPO_URL} from scratch, in a single unbroken sequence: download the repository, sync it, confirm its state, and stage ${EVIDENCE_FILE} — all in one line.`,
            scenario: `Chain the four commands you've learned so far into one line, in order: clone ${REPO_URL}, pull, check status, then stage ${EVIDENCE_FILE}.`,
            order: 5, xpReward: 25, coinReward: 15,
        },
        command: {
            command: `git clone ${REPO_URL} && git pull && git status && git add ${EVIDENCE_FILE}`,
            validPattern: `^git\\s+clone\\s+${esc(REPO_URL)}\\s*&&\\s*git\\s+pull\\s*&&\\s*git\\s+status\\s*&&\\s*git\\s+add\\s+${esc(EVIDENCE_FILE)}\\s*$`,
            caseSensitive: true,
            title: 'Chained Command · Full Intake', subtitle: 'Combine clone, pull, status, and add into one sequence', difficulty: 'medium',
            about: `Field agents don't have time to run four separate commands one at a time under pressure. HQ expects you to execute the full intake sequence — clone, pull, status, add — as a single chained command.`,
            briefing: {
                whatItDoes: { body: 'The && operator chains commands together: each one only runs if the previous one succeeded. This lets you execute a whole sequence of Git operations in a single line, and the chain stops immediately if anything fails.' },
                basicSyntax: { blocks: [
                        { code: 'cmd1 && cmd2 && cmd3', desc: 'Run each command in order, only continuing if the previous one succeeded' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git clone ${REPO_URL} && git pull && git status && git add ${EVIDENCE_FILE}` },
                        { output: "Cloning into 'shadow-breach'...\ndone.\nAlready up to date.\nOn branch main\nChanges to be committed:\n  new file:   intel-report.md" },
                    ]},
                watchOutFor: { warnings: [
                        'If any command in the chain fails, everything after that && will not run.',
                        'Spacing matters — leave a space on both sides of &&.',
                    ]},
            },
            hint: `Chain in this exact order: git clone ${REPO_URL}, then && git pull, then && git status, then && git add ${EVIDENCE_FILE}.`,
            hintUnlocksAfterAttempts: 1,
            battle: {
                expected: `git clone ${REPO_URL} && git pull && git status && git add ${EVIDENCE_FILE}`,
                hint: `Chain in this exact order: git clone ${REPO_URL}, then && git pull, then && git status, then && git add ${EVIDENCE_FILE}.`,
            },
        },
    },
    {
        mission: {
            missionNumber: 6, title: 'Mission 06 · Review the Case History',
            story: 'A new analyst suspects a mole tampered with the repository weeks ago. Review the full commit history to identify suspicious activity.',
            scenario: 'You need to see every change ever committed, who made it, and when. What command do you run?',
            order: 6, xpReward: 10, coinReward: 5,
        },
        command: {
            command: 'git log', validPattern: '^git\\s+log(\\s+.*)?$', caseSensitive: true,
            title: 'git log', subtitle: 'Review the commit history', difficulty: 'easy',
            about: 'Someone tampered with the case file weeks ago, and internal affairs wants the full paper trail — every commit, every author, every timestamp.',
            briefing: {
                whatItDoes: { body: 'git log displays the commit history in reverse chronological order — each commit\'s hash, author, date, and message.' },
                basicSyntax: { blocks: [
                        { code: 'git log', desc: 'Show the full commit history' },
                        { code: 'git log --oneline', desc: 'Show a compact, one-line-per-commit summary' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git log --oneline' },
                        { output: "e4f5g6h Add intel report\na1b2c3d Initial clone of case files" },
                    ]},
                watchOutFor: { warnings: [
                        'The full log can be very long on active repositories — pipe it through less or use --oneline.',
                    ]},
            },
            hint: 'Displays the commit history in reverse chronological order.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git log', hint: 'Displays the commit history in reverse chronological order.' },
        },
    },
    {
        mission: {
            missionNumber: 7, title: 'Mission 07 · Compare the Evidence',
            story: 'Two versions of the same intelligence file exist. You need to see exactly what changed line by line before committing.',
            scenario: 'You\'ve edited a file but haven\'t staged it yet. What command shows exactly what lines were added or removed?',
            order: 7, xpReward: 10, coinReward: 5,
        },
        command: {
            command: 'git diff', validPattern: '^git\\s+diff(\\s+.*)?$', caseSensitive: true,
            title: 'git diff', subtitle: 'See exact line-by-line changes', difficulty: 'easy',
            about: 'Two versions of the same evidence file don\'t match. Before you commit anything, you need to see precisely which lines changed.',
            briefing: {
                whatItDoes: { body: 'git diff shows the exact line-by-line differences between your working directory and the last commit — additions and deletions, highlighted.' },
                basicSyntax: { blocks: [
                        { code: 'git diff', desc: 'Show unstaged changes' },
                        { code: 'git diff --staged', desc: 'Show changes that are already staged' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git diff' },
                        { output: "-Target: unknown\n+Target: downtown data center" },
                    ]},
                watchOutFor: { warnings: [
                        'git diff alone only shows unstaged changes — staged changes need --staged.',
                    ]},
            },
            hint: 'Shows differences between your working directory and the last commit.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git diff', hint: 'Shows differences between your working directory and the last commit.' },
        },
    },
    {
        mission: {
            missionNumber: 8, title: 'Mission 08 · Discard a Compromised File',
            story: `An analyst accidentally overwrote ${CORRUPTED_FILE} with corrupted data. Restore it before the error becomes permanent.`,
            scenario: `${CORRUPTED_FILE} has been modified incorrectly and is not yet staged. What command reverts exactly that file to the last commit?`,
            order: 8, xpReward: 10, coinReward: 5,
        },
        command: {
            command: `git restore ${CORRUPTED_FILE}`,
            validPattern: `^git\\s+restore\\s+${esc(CORRUPTED_FILE)}\\s*$`,
            caseSensitive: true,
            title: 'git restore', subtitle: 'Discard uncommitted changes to a file', difficulty: 'easy',
            about: `${CORRUPTED_FILE} was just corrupted by a bad edit. It hasn't been staged yet, so the last committed version is still safely recoverable.`,
            briefing: {
                whatItDoes: { body: 'git restore discards uncommitted changes in the working directory, reverting a file back to its last committed state.' },
                basicSyntax: { blocks: [
                        { code: 'git restore <file>', desc: 'Discard working-directory changes to a specific file' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git restore ${CORRUPTED_FILE}` },
                        { output: 'File restored to last committed state.' },
                    ]},
                watchOutFor: { warnings: [
                        'This permanently discards uncommitted changes to the file — there is no undo once it runs.',
                    ]},
            },
            hint: `Use git restore followed by the exact filename: ${CORRUPTED_FILE}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git restore ${CORRUPTED_FILE}`, hint: `Use git restore followed by the exact filename: ${CORRUPTED_FILE}` },
        },
    },
    {
        mission: {
            missionNumber: 9, title: 'Mission 09 · Create a Covert Branch',
            story: `HQ wants you to test a decoy operation but you can't risk corrupting the main investigation. Create a new branch named ${DECOY_BRANCH}.`,
            scenario: `What command creates a new branch called exactly ${DECOY_BRANCH}?`,
            order: 9, xpReward: 10, coinReward: 5,
        },
        command: {
            command: `git branch ${DECOY_BRANCH}`,
            validPattern: `^git\\s+branch\\s+${esc(DECOY_BRANCH)}\\s*$`,
            caseSensitive: true,
            title: 'git branch', subtitle: 'Create a new, independent line of development', difficulty: 'easy',
            about: `HQ wants a decoy operation tested without touching the main investigation. That means working in an isolated branch: ${DECOY_BRANCH}.`,
            briefing: {
                whatItDoes: { body: 'git branch creates a new branch — an independent line of development that starts from your current commit but never affects other branches until you merge it.' },
                basicSyntax: { blocks: [
                        { code: 'git branch <branch-name>', desc: 'Create a new branch (does not switch to it)' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git branch ${DECOY_BRANCH}` },
                        { prompt: '$', cmd: 'git branch', comment: '# confirm it was created' },
                        { output: `  main\n* ${DECOY_BRANCH}` },
                    ]},
                watchOutFor: { warnings: [
                        'git branch only creates the branch — it does not switch you onto it. You still need git checkout or git switch.',
                    ]},
            },
            hint: `Use git branch followed by the exact branch name: ${DECOY_BRANCH}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git branch ${DECOY_BRANCH}`, hint: `Use git branch followed by the exact branch name: ${DECOY_BRANCH}` },
        },
    },
    {
        mission: {
            missionNumber: 10, title: 'Field Assignment 2 · Audit and Isolate',
            story: `Before you can safely investigate further, run the full audit-and-isolate protocol in one line: review the case history, compare the evidence, discard the corrupted file ${CORRUPTED_FILE}, then spin up the ${DECOY_BRANCH} branch for further testing.`,
            scenario: `Chain the four commands you've learned since Mission 6 into one line: log, diff, restore ${CORRUPTED_FILE}, then create branch ${DECOY_BRANCH}.`,
            order: 10, xpReward: 25, coinReward: 15,
        },
        command: {
            command: `git log && git diff && git restore ${CORRUPTED_FILE} && git branch ${DECOY_BRANCH}`,
            validPattern: `^git\\s+log\\s*&&\\s*git\\s+diff\\s*&&\\s*git\\s+restore\\s+${esc(CORRUPTED_FILE)}\\s*&&\\s*git\\s+branch\\s+${esc(DECOY_BRANCH)}\\s*$`,
            caseSensitive: true,
            title: 'Chained Command · Audit and Isolate', subtitle: 'Combine log, diff, restore, and branch into one sequence', difficulty: 'medium',
            about: 'This is your Level 1 field certification. HQ wants the full audit-and-isolate sequence executed as one clean line, no wasted motion.',
            briefing: {
                whatItDoes: { body: 'Chaining these four commands with && lets you audit history, compare changes, clean up a corrupted file, and prepare an isolated branch — all as a single verified sequence.' },
                basicSyntax: { blocks: [
                        { code: 'cmd1 && cmd2 && cmd3 && cmd4', desc: 'Each command runs only if the one before it succeeded' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git log && git diff && git restore ${CORRUPTED_FILE} && git branch ${DECOY_BRANCH}` },
                        { output: `e4f5g6h Add intel report\n(no diff output — working tree clean)\nFile restored to last committed state.` },
                    ]},
                watchOutFor: { warnings: [
                        'If git diff shows nothing, that\'s expected — the chain still continues since diff didn\'t fail.',
                        'Get the branch name exactly right — a typo creates a different branch entirely.',
                    ]},
            },
            hint: `Chain in this exact order: git log, then && git diff, then && git restore ${CORRUPTED_FILE}, then && git branch ${DECOY_BRANCH}.`,
            hintUnlocksAfterAttempts: 1,
            battle: {
                expected: `git log && git diff && git restore ${CORRUPTED_FILE} && git branch ${DECOY_BRANCH}`,
                hint: `Chain in this exact order: git log, then && git diff, then && git restore ${CORRUPTED_FILE}, then && git branch ${DECOY_BRANCH}.`,
            },
        },
    },

    // ══════════════════════════════════════════════════════════
    // LEVEL 2 — Deep Infiltration
    // ══════════════════════════════════════════════════════════
    {
        mission: {
            missionNumber: 1, title: 'Mission 01 · Stash the Unfinished Work',
            story: 'An urgent new assignment just came in, but your current work isn\'t ready to commit. You need a clean workspace immediately.',
            scenario: 'You have unstaged changes in progress and need a clean directory right now. What command temporarily saves your work without committing?',
            order: 1, xpReward: 20, coinReward: 10,
        },
        command: {
            command: 'git stash', validPattern: '^git\\s+stash(\\s+.*)?$', caseSensitive: true,
            title: 'git stash', subtitle: 'Shelve uncommitted changes temporarily', difficulty: 'medium',
            about: 'A priority-one assignment just landed and it can\'t wait. Your current changes aren\'t ready to commit, but you need a clean working directory right now.',
            briefing: {
                whatItDoes: { body: 'git stash saves your uncommitted changes on a stack and reverts your working directory to match the last commit, letting you switch context cleanly.' },
                basicSyntax: { blocks: [
                        { code: 'git stash', desc: 'Stash all uncommitted changes' },
                        { code: 'git stash list', desc: 'See everything currently stashed' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git stash' },
                        { output: 'Saved working directory and index state WIP on main: e4f5g6h Add intel report' },
                    ]},
                watchOutFor: { warnings: [
                        'Stashed changes aren\'t committed anywhere — if you delete the stash, they\'re gone.',
                    ]},
            },
            hint: 'Shelves all uncommitted changes so you can switch focus safely.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git stash', hint: 'Shelves all uncommitted changes so you can switch focus safely.' },
        },
    },
    {
        mission: {
            missionNumber: 2, title: 'Mission 02 · Recover the Stashed Work',
            story: 'The emergency has been handled. Retrieve your previously saved work so you can finish the investigation you had to pause.',
            scenario: 'You previously stashed your in-progress changes. What command restores them to your working directory?',
            order: 2, xpReward: 20, coinReward: 10,
        },
        command: {
            command: 'git stash pop', validPattern: '^git\\s+stash\\s+pop(\\s+.*)?$', caseSensitive: true,
            title: 'git stash pop', subtitle: 'Restore your most recently stashed changes', difficulty: 'medium',
            about: 'The emergency assignment is handled. Time to pick up exactly where you left off — the changes you stashed earlier are still waiting.',
            briefing: {
                whatItDoes: { body: 'git stash pop restores the most recently stashed changes back into your working directory and removes that entry from the stash stack.' },
                basicSyntax: { blocks: [
                        { code: 'git stash pop', desc: 'Restore and remove the most recent stash' },
                        { code: 'git stash apply', desc: 'Restore the most recent stash but keep it on the stack' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git stash pop' },
                        { output: 'On branch main\nChanges not staged for commit:\n  modified:   intel-report.md\nDropped stash@{0}' },
                    ]},
                watchOutFor: { warnings: [
                        'If the restored changes conflict with newer work, you\'ll need to resolve the conflict manually.',
                    ]},
            },
            hint: 'Restores the most recently stashed changes and removes them from the stash.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git stash pop', hint: 'Restores the most recently stashed changes and removes them from the stash.' },
        },
    },
    {
        mission: {
            missionNumber: 3, title: 'Mission 03 · Correct Missing Evidence',
            story: 'Minutes after submitting your report, an analyst notices an important forensic log was accidentally omitted.',
            scenario: 'You staged the missing log and want to add it to your last commit while keeping the existing message. What command do you use?',
            order: 3, xpReward: 20, coinReward: 10,
        },
        command: {
            command: 'git commit --amend --no-edit',
            validPattern: '^git\\s+commit\\s+(--amend\\s+--no-edit|--no-edit\\s+--amend)\\s*$',
            caseSensitive: true,
            title: 'git commit --amend', subtitle: 'Update the most recent commit', difficulty: 'medium',
            about: 'Minutes after submission, HQ flags a missing forensic log. Rather than create a whole new commit for one file, you fold it into the one you just made.',
            briefing: {
                whatItDoes: { body: 'git commit --amend modifies the most recent commit instead of creating a new one. Adding --no-edit keeps the original commit message unchanged.' },
                basicSyntax: { blocks: [
                        { code: 'git commit --amend --no-edit', desc: 'Add staged changes to the last commit, keep the same message' },
                        { code: 'git commit --amend', desc: 'Add staged changes to the last commit, and edit the message' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git add missing-log.txt' },
                        { prompt: '$', cmd: 'git commit --amend --no-edit' },
                        { output: '[main a1b2c3d] Add intel report\n 2 files changed' },
                    ]},
                watchOutFor: { warnings: [
                        'Amending rewrites the last commit\'s hash — never amend a commit that has already been pushed and shared with others.',
                    ]},
            },
            hint: 'The --amend flag modifies the last commit. Add --no-edit to keep the message unchanged.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git commit --amend --no-edit', hint: 'The --amend flag modifies the last commit. Add --no-edit to keep the message unchanged.' },
        },
    },
    {
        mission: {
            missionNumber: 4, title: 'Mission 04 · Push the Intelligence to HQ',
            story: 'Your local findings are solid and ready to be shared. Transmit your commits to the remote repository.',
            scenario: 'You\'ve committed your changes locally. What command sends them to the remote repository?',
            order: 4, xpReward: 20, coinReward: 10,
        },
        command: {
            command: 'git push', validPattern: '^git\\s+push(\\s+.*)?$', caseSensitive: true,
            title: 'git push', subtitle: 'Upload local commits to the remote repository', difficulty: 'medium',
            about: 'Your findings are solid and committed locally. Now the rest of the team needs access — transmit your commits to HQ\'s shared repository.',
            briefing: {
                whatItDoes: { body: 'git push uploads your local commits to the remote repository, making them available to every other agent working from the same repo.' },
                basicSyntax: { blocks: [
                        { code: 'git push', desc: 'Push to the branch your local branch tracks' },
                        { code: 'git push <remote> <branch>', desc: 'Push explicitly to a specific remote and branch' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git push' },
                        { output: "Enumerating objects: 5, done.\nTo github.com:us-cyber/shadow-breach.git\n   a1b2c3d..e4f5g6h  main -> main" },
                    ]},
                watchOutFor: { warnings: [
                        'If the remote has commits you don\'t have locally, push will be rejected — pull first.',
                    ]},
            },
            hint: 'Uploads your local commits to the remote repository.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git push', hint: 'Uploads your local commits to the remote repository.' },
        },
    },
    {
        mission: {
            missionNumber: 5, title: 'Field Assignment 1 · Save, Restore, Correct, Transmit',
            story: 'A full field cycle, back to back: shelve your work for the priority interrupt, recover it once clear, fold in the missing evidence without a new commit, then transmit everything to HQ — all in one line.',
            scenario: 'Chain the four commands you\'ve learned so far into one line, in order: stash, stash pop, commit --amend --no-edit, then push.',
            order: 5, xpReward: 40, coinReward: 25,
        },
        command: {
            command: 'git stash && git stash pop && git commit --amend --no-edit && git push',
            validPattern: '^git\\s+stash\\s*&&\\s*git\\s+stash\\s+pop\\s*&&\\s*git\\s+commit\\s+(--amend\\s+--no-edit|--no-edit\\s+--amend)\\s*&&\\s*git\\s+push\\s*$',
            caseSensitive: true,
            title: 'Chained Command · Full Field Cycle', subtitle: 'Combine stash, stash pop, amend, and push into one sequence', difficulty: 'hard',
            about: 'This is a full end-to-end field cycle — interrupt handling, correction, and transmission — executed as one verified sequence with no room for error.',
            briefing: {
                whatItDoes: { body: 'Chaining stash, stash pop, commit --amend --no-edit, and push together simulates a real high-pressure field cycle: save your state, recover it, fix a commit in place, and ship it — with the chain aborting immediately if any step fails.' },
                basicSyntax: { blocks: [
                        { code: 'cmd1 && cmd2 && cmd3 && cmd4', desc: 'Each command runs only if the previous one succeeded' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git stash && git stash pop && git commit --amend --no-edit && git push' },
                    ]},
                watchOutFor: { warnings: [
                        'If there\'s nothing to stash, git stash may report "No local changes to save" and the chain can behave differently — make sure you have unstaged changes before running this.',
                        'Amend + push together rewrites and re-uploads history — never do this on a shared branch others are actively working on.',
                    ]},
            },
            hint: 'Chain in this exact order: git stash, then && git stash pop, then && git commit --amend --no-edit, then && git push.',
            hintUnlocksAfterAttempts: 1,
            battle: {
                expected: 'git stash && git stash pop && git commit --amend --no-edit && git push',
                hint: 'Chain in this exact order: git stash, then && git stash pop, then && git commit --amend --no-edit, then && git push.',
            },
        },
    },
    {
        mission: {
            missionNumber: 6, title: 'Mission 06 · Tag a Critical Milestone',
            story: `Your team has reached a major checkpoint. Mark this moment permanently in repository history as ${RELEASE_TAG}.`,
            scenario: `You want to mark the current commit as version ${RELEASE_TAG} of the investigation. What command creates that exact label?`,
            order: 6, xpReward: 20, coinReward: 10,
        },
        command: {
            command: `git tag ${RELEASE_TAG}`,
            validPattern: `^git\\s+tag\\s+${esc(RELEASE_TAG)}\\s*$`,
            caseSensitive: true,
            title: 'git tag', subtitle: 'Mark a specific commit with a permanent label', difficulty: 'medium',
            about: `The investigation has reached a major checkpoint. HQ wants this exact commit permanently labeled ${RELEASE_TAG} so it can always be referenced.`,
            briefing: {
                whatItDoes: { body: 'git tag marks a specific commit with a memorable, permanent label — commonly used for release versions or milestones.' },
                basicSyntax: { blocks: [
                        { code: 'git tag <tag-name>', desc: 'Tag the current commit' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git tag ${RELEASE_TAG}` },
                        { prompt: '$', cmd: 'git tag', comment: '# confirm it exists' },
                        { output: RELEASE_TAG },
                    ]},
                watchOutFor: { warnings: [
                        'Tags aren\'t pushed automatically — git push --tags is needed to share them with the remote.',
                    ]},
            },
            hint: `Use git tag followed by the exact tag name: ${RELEASE_TAG}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git tag ${RELEASE_TAG}`, hint: `Use git tag followed by the exact tag name: ${RELEASE_TAG}` },
        },
    },
    {
        mission: {
            missionNumber: 7, title: 'Mission 07 · List All Branches',
            story: 'The investigation has grown and multiple agents are working on parallel branches. You need a full picture of every branch.',
            scenario: 'You want to see every branch in both your local repository and the remote. What command shows them all?',
            order: 7, xpReward: 20, coinReward: 10,
        },
        command: {
            command: 'git branch -a', validPattern: '^git\\s+branch\\s+-a(\\s+.*)?$', caseSensitive: true,
            title: 'git branch -a', subtitle: 'List every local and remote branch', difficulty: 'medium',
            about: 'Multiple agents are now working in parallel across several branches. You need the full picture — every branch that exists, local and remote.',
            briefing: {
                whatItDoes: { body: 'git branch -a lists every branch: local branches, plus remote-tracking branches that mirror what exists on the server.' },
                basicSyntax: { blocks: [
                        { code: 'git branch', desc: 'List local branches only' },
                        { code: 'git branch -a', desc: 'List local and remote branches' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git branch -a' },
                        { output: `* main\n  ${DECOY_BRANCH}\n  remotes/origin/main` },
                    ]},
                watchOutFor: { warnings: [
                        'Remote branches shown here are a local snapshot — run git fetch first if you suspect they\'re out of date.',
                    ]},
            },
            hint: 'Use git branch with the -a flag to list all local and remote branches.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git branch -a', hint: 'Use git branch with the -a flag to list all local and remote branches.' },
        },
    },
    {
        mission: {
            missionNumber: 8, title: 'Mission 08 · Undo the Last Commit Safely',
            story: 'A commit was just pushed that accidentally exposed a classified source. Undo it while keeping history intact.',
            scenario: 'You need to reverse the most recent commit without deleting it from history. What command do you use?',
            order: 8, xpReward: 20, coinReward: 10,
        },
        command: {
            command: 'git revert HEAD', validPattern: '^git\\s+revert\\s+HEAD\\s*$', caseSensitive: true,
            title: 'git revert', subtitle: 'Undo a commit without erasing history', difficulty: 'medium',
            about: 'A commit that was already pushed accidentally exposed a classified source. It has to be undone — but since it\'s already shared, history can\'t simply be erased.',
            briefing: {
                whatItDoes: { body: 'git revert creates a brand-new commit that undoes the changes from a previous commit, without deleting or rewriting anything. This makes it safe to use on shared branches.' },
                basicSyntax: { blocks: [
                        { code: 'git revert HEAD', desc: 'Undo the most recent commit with a new commit' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git revert HEAD' },
                        { output: '[main f1a2b3c] Revert "Add source identification"' },
                    ]},
                watchOutFor: { warnings: [
                        'revert adds a new commit rather than removing the old one — history stays intact, which is exactly the point on shared branches.',
                    ]},
            },
            hint: 'Creates a new commit that undoes the previous one, preserving all history.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git revert HEAD', hint: 'Creates a new commit that undoes the previous one, preserving all history.' },
        },
    },
    {
        mission: {
            missionNumber: 9, title: 'Mission 09 · Reset to a Previous State',
            story: 'A commit was made locally that was a complete mistake. Since it hasn\'t been pushed yet, you can erase it entirely.',
            scenario: 'You need to completely remove the most recent local commit and discard all its changes. What command does this?',
            order: 9, xpReward: 20, coinReward: 10,
        },
        command: {
            command: 'git reset --hard HEAD~1', validPattern: '^git\\s+reset\\s+--hard\\s+HEAD~1\\s*$', caseSensitive: true,
            title: 'git reset --hard', subtitle: 'Erase the last commit and its changes entirely', difficulty: 'medium',
            about: 'A local-only commit turned out to be a complete mistake. Since nothing has been pushed yet, it can simply be erased as if it never happened.',
            briefing: {
                whatItDoes: { body: 'git reset --hard moves your branch pointer backward and discards all changes from the commits it passes over — completely and irreversibly.' },
                basicSyntax: { blocks: [
                        { code: 'git reset --hard HEAD~1', desc: 'Erase the most recent commit and its changes' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git reset --hard HEAD~1' },
                        { output: 'HEAD is now at a1b2c3d Add intel report' },
                    ]},
                watchOutFor: { warnings: [
                        'This is destructive — uncommitted and now-discarded changes are gone unless recoverable via reflog.',
                        'Never reset --hard a commit that has already been pushed and shared.',
                    ]},
            },
            hint: 'Use git reset --hard followed by HEAD~1 to erase the last commit entirely.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git reset --hard HEAD~1', hint: 'Use git reset --hard followed by HEAD~1 to erase the last commit entirely.' },
        },
    },
    {
        mission: {
            missionNumber: 10, title: 'Field Assignment 2 · Milestone, Audit, Undo, Reset',
            story: `Close out the investigation phase in one motion: mark this checkpoint as ${RELEASE_TAG}, pull a full branch listing for the record, safely revert the exposed commit, then erase the mistaken local commit entirely.`,
            scenario: `Chain the four commands you've learned since Mission 6 into one line: tag ${RELEASE_TAG}, branch -a, revert HEAD, then reset --hard HEAD~1.`,
            order: 10, xpReward: 40, coinReward: 25,
        },
        command: {
            command: `git tag ${RELEASE_TAG} && git branch -a && git revert HEAD && git reset --hard HEAD~1`,
            validPattern: `^git\\s+tag\\s+${esc(RELEASE_TAG)}\\s*&&\\s*git\\s+branch\\s+-a\\s*&&\\s*git\\s+revert\\s+HEAD\\s*&&\\s*git\\s+reset\\s+--hard\\s+HEAD~1\\s*$`,
            caseSensitive: true,
            title: 'Chained Command · Close the Phase', subtitle: 'Combine tag, branch -a, revert, and reset into one sequence', difficulty: 'hard',
            about: 'Your Level 2 field certification. Four distinct operations — marking, auditing, safely undoing, and destructively resetting — executed as one exact sequence.',
            briefing: {
                whatItDoes: { body: 'This chain mixes a permanent label, a read-only audit, a safe historical undo, and a destructive reset — testing that you can tell these very different operations apart and execute them correctly in sequence.' },
                basicSyntax: { blocks: [
                        { code: 'cmd1 && cmd2 && cmd3 && cmd4', desc: 'Each command runs only if the previous one succeeded' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git tag ${RELEASE_TAG} && git branch -a && git revert HEAD && git reset --hard HEAD~1` },
                    ]},
                watchOutFor: { warnings: [
                        'revert and reset --hard sound similar but behave very differently — revert is safe on shared history, reset --hard is destructive.',
                        'Once this chain runs, the reset step is irreversible without reflog.',
                    ]},
            },
            hint: `Chain in this exact order: git tag ${RELEASE_TAG}, then && git branch -a, then && git revert HEAD, then && git reset --hard HEAD~1.`,
            hintUnlocksAfterAttempts: 1,
            battle: {
                expected: `git tag ${RELEASE_TAG} && git branch -a && git revert HEAD && git reset --hard HEAD~1`,
                hint: `Chain in this exact order: git tag ${RELEASE_TAG}, then && git branch -a, then && git revert HEAD, then && git reset --hard HEAD~1.`,
            },
        },
    },

    // ══════════════════════════════════════════════════════════
    // LEVEL 3 — Ghost Protocol
    // ══════════════════════════════════════════════════════════
    {
        mission: {
            missionNumber: 1, title: 'Mission 01 · Cherry-Pick a Single Commit',
            story: `A fellow agent on a different branch made one specific commit — hash ${FIX_HASH} — containing a critical decryption fix. You need only that one commit.`,
            scenario: `The fix lives in commit ${FIX_HASH}. What command applies just that one commit to your current branch?`,
            order: 1, xpReward: 30, coinReward: 15,
        },
        command: {
            command: `git cherry-pick ${FIX_HASH}`,
            validPattern: `^git\\s+cherry-pick\\s+${esc(FIX_HASH)}\\s*$`,
            caseSensitive: true,
            title: 'git cherry-pick', subtitle: 'Apply a single specific commit', difficulty: 'hard',
            about: `A colleague on another branch has a critical decryption fix in a single commit, ${FIX_HASH}. You don't need their whole branch — just that one change.`,
            briefing: {
                whatItDoes: { body: 'git cherry-pick applies the exact changes from a single specific commit onto your current branch, without bringing over anything else from that commit\'s branch.' },
                basicSyntax: { blocks: [
                        { code: 'git cherry-pick <commit-hash>', desc: 'Apply one specific commit to the current branch' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git cherry-pick ${FIX_HASH}` },
                        { output: `[main 9c1d2e3] Fix decryption key rotation` },
                    ]},
                watchOutFor: { warnings: [
                        'Cherry-picking can produce merge conflicts if your branch has diverged significantly from the source.',
                        'It creates a brand-new commit with a different hash — it\'s a copy of the change, not a move.',
                    ]},
            },
            hint: `Use git cherry-pick followed by the exact commit hash: ${FIX_HASH}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git cherry-pick ${FIX_HASH}`, hint: `Use git cherry-pick followed by the exact commit hash: ${FIX_HASH}` },
        },
    },
    {
        mission: {
            missionNumber: 2, title: 'Mission 02 · Rebase Your Branch',
            story: 'Your branch was created two weeks ago and main has moved far ahead. You want a clean linear history.',
            scenario: 'You want to move your branch\'s commits to sit on top of the latest main branch. What command does this cleanly?',
            order: 2, xpReward: 30, coinReward: 15,
        },
        command: {
            command: 'git rebase main',
            validPattern: '^git\\s+rebase\\s+main\\s*$',
            caseSensitive: true,
            title: 'git rebase', subtitle: 'Replay your commits on top of another branch', difficulty: 'hard',
            about: 'Your branch has fallen two weeks behind main. Rather than a tangled merge commit, HQ wants a clean, linear history — replay your work on top of the latest main.',
            briefing: {
                whatItDoes: { body: 'git rebase replays your branch\'s commits one by one on top of another branch\'s latest commit, producing a clean linear history instead of a merge commit.' },
                basicSyntax: { blocks: [
                        { code: 'git rebase main', desc: 'Replay the current branch\'s commits on top of main' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git rebase main' },
                        { output: "Successfully rebased and updated refs/heads/investigation." },
                    ]},
                watchOutFor: { warnings: [
                        'Rebasing rewrites commit hashes — never rebase a branch that others have already pulled and built on top of.',
                        'Conflicts can occur at each replayed commit, not just once, like with a merge.',
                    ]},
            },
            hint: 'Use git rebase followed by main to replay your commits on top of it.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git rebase main', hint: 'Use git rebase followed by main to replay your commits on top of it.' },
        },
    },
    {
        mission: {
            missionNumber: 3, title: 'Mission 03 · Apply a Stash to a Different Branch',
            story: `You stashed work while on the wrong branch and switching back would cause conflicts. Apply it to a brand new branch called ${RECOVERY_BRANCH}.`,
            scenario: `What command applies your stash onto a new branch called exactly ${RECOVERY_BRANCH}, avoiding merge conflicts?`,
            order: 3, xpReward: 30, coinReward: 15,
        },
        command: {
            command: `git stash branch ${RECOVERY_BRANCH}`,
            validPattern: `^git\\s+stash\\s+branch\\s+${esc(RECOVERY_BRANCH)}\\s*$`,
            caseSensitive: true,
            title: 'git stash branch', subtitle: 'Apply a stash on a new branch', difficulty: 'hard',
            about: `Your stashed work doesn't belong on the branch you're on — applying it here would cause conflicts. The clean solution is a dedicated branch: ${RECOVERY_BRANCH}.`,
            briefing: {
                whatItDoes: { body: 'git stash branch creates a new branch starting from the commit where the stash was originally made, then applies the stash to it — sidestepping conflicts that would occur applying it elsewhere.' },
                basicSyntax: { blocks: [
                        { code: 'git stash branch <branch-name>', desc: 'Create a new branch and apply the most recent stash to it' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git stash branch ${RECOVERY_BRANCH}` },
                        { output: `Switched to a new branch '${RECOVERY_BRANCH}'\nDropped stash@{0}` },
                    ]},
                watchOutFor: { warnings: [
                        'This both creates the branch and switches you onto it in one step — unlike plain git branch.',
                    ]},
            },
            hint: `Use git stash branch followed by the exact branch name: ${RECOVERY_BRANCH}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git stash branch ${RECOVERY_BRANCH}`, hint: `Use git stash branch followed by the exact branch name: ${RECOVERY_BRANCH}` },
        },
    },
    {
        mission: {
            missionNumber: 4, title: 'Mission 04 · Squash Commits Before Merging',
            story: `A feature branch named ${FEATURE_BRANCH} has many small, messy commits. Collapse them into a single clean change before merging.`,
            scenario: `You want to bring in all changes from ${FEATURE_BRANCH} as a single staged change. What command does this?`,
            order: 4, xpReward: 30, coinReward: 15,
        },
        command: {
            command: `git merge --squash ${FEATURE_BRANCH}`,
            validPattern: `^git\\s+merge\\s+--squash\\s+${esc(FEATURE_BRANCH)}\\s*$`,
            caseSensitive: true,
            title: 'git merge --squash', subtitle: 'Combine a branch\'s commits into one staged change', difficulty: 'hard',
            about: `${FEATURE_BRANCH} is functionally done, but its commit history is a mess of tiny, messy commits. HQ wants it merged in as a single clean change.`,
            briefing: {
                whatItDoes: { body: 'git merge --squash takes all the changes from another branch and stages them as one combined change in your working directory, without creating a merge commit or preserving the source branch\'s individual commit history.' },
                basicSyntax: { blocks: [
                        { code: 'git merge --squash <branch-name>', desc: 'Stage another branch\'s combined changes as one change' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git merge --squash ${FEATURE_BRANCH}` },
                        { prompt: '$', cmd: 'git commit -m "Add feature: encrypted comms"', comment: '# still need to commit after squashing' },
                    ]},
                watchOutFor: { warnings: [
                        '--squash stages the changes but does NOT commit them automatically — you still need a separate git commit.',
                        'The individual commit history from the feature branch is not preserved.',
                    ]},
            },
            hint: `Use git merge --squash followed by the exact branch name: ${FEATURE_BRANCH}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git merge --squash ${FEATURE_BRANCH}`, hint: `Use git merge --squash followed by the exact branch name: ${FEATURE_BRANCH}` },
        },
    },
    {
        mission: {
            missionNumber: 5, title: 'Field Assignment 1 · Precision Recovery Sequence',
            story: `Execute a full precision-recovery sequence in one line: pull in the decryption fix from ${FIX_HASH}, rebase cleanly onto main, isolate your stash onto ${RECOVERY_BRANCH}, then fold in ${FEATURE_BRANCH} as one clean change.`,
            scenario: `Chain the four commands you've learned so far into one line, in order: cherry-pick ${FIX_HASH}, rebase main, stash branch ${RECOVERY_BRANCH}, then merge --squash ${FEATURE_BRANCH}.`,
            order: 5, xpReward: 50, coinReward: 30,
        },
        command: {
            command: `git cherry-pick ${FIX_HASH} && git rebase main && git stash branch ${RECOVERY_BRANCH} && git merge --squash ${FEATURE_BRANCH}`,
            validPattern: `^git\\s+cherry-pick\\s+${esc(FIX_HASH)}\\s*&&\\s*git\\s+rebase\\s+main\\s*&&\\s*git\\s+stash\\s+branch\\s+${esc(RECOVERY_BRANCH)}\\s*&&\\s*git\\s+merge\\s+--squash\\s+${esc(FEATURE_BRANCH)}\\s*$`,
            caseSensitive: true,
            title: 'Chained Command · Precision Recovery', subtitle: 'Combine cherry-pick, rebase, stash branch, and squash-merge', difficulty: 'hard',
            about: 'Four of the most surgical operations in Git, executed back to back with zero margin for error. This is Ghost Protocol territory.',
            briefing: {
                whatItDoes: { body: 'This chain applies a single commit, rewrites your branch\'s base, isolates stashed work onto a new branch, and squash-merges a messy feature branch — four fundamentally different history-rewriting operations in sequence.' },
                basicSyntax: { blocks: [
                        { code: 'cmd1 && cmd2 && cmd3 && cmd4', desc: 'Each command runs only if the previous one succeeded' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git cherry-pick ${FIX_HASH} && git rebase main && git stash branch ${RECOVERY_BRANCH} && git merge --squash ${FEATURE_BRANCH}` },
                    ]},
                watchOutFor: { warnings: [
                        'Any conflict at any step halts the entire chain — resolve and continue manually before retrying.',
                        'This is the most destructive-capable chain in your training so far — get every identifier exactly right.',
                    ]},
            },
            hint: `Chain in this exact order: git cherry-pick ${FIX_HASH}, then && git rebase main, then && git stash branch ${RECOVERY_BRANCH}, then && git merge --squash ${FEATURE_BRANCH}.`,
            hintUnlocksAfterAttempts: 1,
            battle: {
                expected: `git cherry-pick ${FIX_HASH} && git rebase main && git stash branch ${RECOVERY_BRANCH} && git merge --squash ${FEATURE_BRANCH}`,
                hint: `Chain in this exact order: git cherry-pick ${FIX_HASH}, then && git rebase main, then && git stash branch ${RECOVERY_BRANCH}, then && git merge --squash ${FEATURE_BRANCH}.`,
            },
        },
    },
    {
        mission: {
            missionNumber: 6, title: 'Mission 06 · Mark a Good Commit During Bisect',
            story: `During the bisect process, you've tested commit ${GOOD_HASH} and confirmed everything was working. Report your finding.`,
            scenario: `Commit ${GOOD_HASH} is confirmed working. What command marks exactly that commit as good during a bisect session?`,
            order: 6, xpReward: 30, coinReward: 15,
        },
        command: {
            command: `git bisect good ${GOOD_HASH}`,
            validPattern: `^git\\s+bisect\\s+good\\s+${esc(GOOD_HASH)}\\s*$`,
            caseSensitive: true,
            title: 'git bisect good', subtitle: 'Mark a commit as working during a bisect search', difficulty: 'hard',
            about: `Mid-bisect, you've confirmed commit ${GOOD_HASH} was working correctly. Reporting it narrows the binary search toward the actual culprit.`,
            briefing: {
                whatItDoes: { body: 'git bisect good marks a commit as known-working, guiding Git\'s binary search to narrow down which later commit introduced a bug.' },
                basicSyntax: { blocks: [
                        { code: 'git bisect good <commit-hash>', desc: 'Mark a specific commit as good (working) during a bisect session' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git bisect good ${GOOD_HASH}` },
                        { output: 'Bisecting: 12 revisions left to test after this (roughly 4 steps)' },
                    ]},
                watchOutFor: { warnings: [
                        'This only makes sense inside an active git bisect start session.',
                    ]},
            },
            hint: `Use git bisect good followed by the exact commit hash: ${GOOD_HASH}`,
            hintUnlocksAfterAttempts: 1,
            battle: { expected: `git bisect good ${GOOD_HASH}`, hint: `Use git bisect good followed by the exact commit hash: ${GOOD_HASH}` },
        },
    },
    {
        mission: {
            missionNumber: 7, title: 'Mission 07 · Recover a Deleted Branch with Reflog',
            story: 'A junior agent accidentally deleted the branch containing three days of critical intelligence before it was merged.',
            scenario: 'A branch was deleted and commits appear lost. What command reveals the full history of HEAD movements?',
            order: 7, xpReward: 30, coinReward: 15,
        },
        command: {
            command: 'git reflog', validPattern: '^git\\s+reflog(\\s+.*)?$', caseSensitive: true,
            title: 'git reflog', subtitle: 'View the log of HEAD movements', difficulty: 'hard',
            about: 'A junior agent just deleted a branch containing three days of work that hadn\'t been merged. The commits aren\'t truly gone yet — Git keeps a private log of everywhere HEAD has been.',
            briefing: {
                whatItDoes: { body: 'git reflog shows a full history of every place HEAD has pointed — including commits from deleted branches — which usually stay recoverable for a while after deletion.' },
                basicSyntax: { blocks: [
                        { code: 'git reflog', desc: 'Show the full history of HEAD movements' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git reflog' },
                        { output: "9c1d2e3 HEAD@{0}: commit: Fix decryption key rotation\na1b2c3d HEAD@{1}: checkout: moving from decoy-operation to main" },
                    ]},
                watchOutFor: { warnings: [
                        'Reflog entries eventually expire — recover what you need as soon as possible after a mistake.',
                    ]},
            },
            hint: 'Git secretly logs every HEAD movement. Use git reflog to pull up that surveillance record.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git reflog', hint: 'Git secretly logs every HEAD movement. Use git reflog to pull up that surveillance record.' },
        },
    },
    {
        mission: {
            missionNumber: 8, title: 'Mission 08 · Rewrite the Last Three Commit Messages',
            story: 'Three recent commits were saved with vague messages that don\'t meet agency standards. Clean them up before pushing.',
            scenario: 'You want to interactively edit the last three commits. What command opens the interactive rebase editor?',
            order: 8, xpReward: 30, coinReward: 15,
        },
        command: {
            command: 'git rebase -i HEAD~3', validPattern: '^git\\s+rebase\\s+-i\\s+HEAD~3\\s*$', caseSensitive: true,
            title: 'git rebase -i', subtitle: 'Interactively edit recent commits', difficulty: 'hard',
            about: 'Three commits went in with vague, unhelpful messages. Before they go anywhere near the shared history, clean them up interactively.',
            briefing: {
                whatItDoes: { body: 'git rebase -i opens an interactive editor listing recent commits, letting you reword, squash, reorder, or drop them before finalizing.' },
                basicSyntax: { blocks: [
                        { code: 'git rebase -i HEAD~3', desc: 'Interactively edit the last 3 commits' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git rebase -i HEAD~3' },
                        { output: "pick a1b2c3d update stuff\npick e4f5g6h fix\npick 9c1d2e3 wip" },
                    ]},
                watchOutFor: { warnings: [
                        'Like other rebases, this rewrites commit hashes — don\'t use it on commits already pushed and shared.',
                    ]},
            },
            hint: 'Use git rebase -i followed by HEAD~3 to open the interactive editor for the last 3 commits.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git rebase -i HEAD~3', hint: 'Use git rebase -i followed by HEAD~3 to open the interactive editor for the last 3 commits.' },
        },
    },
    {
        mission: {
            missionNumber: 9, title: 'Mission 09 · Sign a Commit for Verification',
            story: 'The agency now requires all final intelligence submissions to be cryptographically signed to prove authenticity.',
            scenario: 'You need to create a signed commit with a message confirming your findings. What command creates a GPG-signed commit?',
            order: 9, xpReward: 30, coinReward: 15,
        },
        command: {
            command: 'git commit -S -m "<message>"',
            validPattern: '^git\\s+commit\\s+(-S\\s+-m|-m\\s+["\'].+["\']\\s+-S)\\s+["\'].*["\']?\\s*$',
            caseSensitive: true,
            title: 'git commit -S', subtitle: 'Create a cryptographically signed commit', difficulty: 'hard',
            about: 'Final submissions now require cryptographic proof of authenticity. Your commit needs a GPG signature attached, not just a message.',
            briefing: {
                whatItDoes: { body: 'git commit -S creates a GPG-signed commit, cryptographically proving the commit really came from you and hasn\'t been tampered with.' },
                basicSyntax: { blocks: [
                        { code: 'git commit -S -m "message"', desc: 'Create a signed commit with the given message' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: 'git commit -S -m "Confirm decryption findings"' },
                        { output: '[main 9c1d2e3] Confirm decryption findings' },
                    ]},
                watchOutFor: { warnings: [
                        'Signing requires a GPG key already configured with Git — the commit will fail without one set up.',
                    ]},
            },
            hint: 'Use git commit -S -m followed by your message in quotes to create a signed commit.',
            hintUnlocksAfterAttempts: 1,
            battle: { expected: 'git commit -S -m "Confirm decryption findings"', hint: 'Use git commit -S -m followed by your message in quotes to create a signed commit.' },
        },
    },
    {
        mission: {
            missionNumber: 10, title: 'Field Assignment 2 · Trace, Recover, Rewrite, Sign',
            story: `Close out the operation with a final precision sequence: mark commit ${GOOD_HASH} as good in the bisect trail, pull the full reflog for the record, clean up the last three commit messages, then submit a signed final report.`,
            scenario: `Chain the four commands you've learned since Mission 6 into one line: bisect good ${GOOD_HASH}, reflog, rebase -i HEAD~3, then a signed commit with any message in quotes.`,
            order: 10, xpReward: 50, coinReward: 30,
        },
        command: {
            command: `git bisect good ${GOOD_HASH} && git reflog && git rebase -i HEAD~3 && git commit -S -m "Operation Shadow Breach closed"`,
            validPattern: `^git\\s+bisect\\s+good\\s+${esc(GOOD_HASH)}\\s*&&\\s*git\\s+reflog\\s*&&\\s*git\\s+rebase\\s+-i\\s+HEAD~3\\s*&&\\s*git\\s+commit\\s+-S\\s+-m\\s+["'].+["']\\s*$`,
            caseSensitive: true,
            title: 'Chained Command · Final Certification', subtitle: 'Combine bisect good, reflog, interactive rebase, and a signed commit', difficulty: 'hard',
            about: 'Your Level 3 field certification — and the final test of Operation Shadow Breach. Four advanced operations, one unbroken chain, zero tolerance for error.',
            briefing: {
                whatItDoes: { body: 'This closing chain mixes a bisect update, a read-only history audit, an interactive history rewrite, and a cryptographically signed commit — the full range of surgical Git operations covered across Ghost Protocol.' },
                basicSyntax: { blocks: [
                        { code: 'cmd1 && cmd2 && cmd3 && cmd4', desc: 'Each command runs only if the previous one succeeded' },
                    ]},
                example: { terminal: [
                        { prompt: '$', cmd: `git bisect good ${GOOD_HASH} && git reflog && git rebase -i HEAD~3 && git commit -S -m "Operation Shadow Breach closed"` },
                    ]},
                watchOutFor: { warnings: [
                        'The final commit message can be anything in quotes — only the preceding three commands need to match exactly.',
                        'This is the final exam of the operation. Read every step twice before executing.',
                    ]},
            },
            hint: `Chain in this exact order: git bisect good ${GOOD_HASH}, then && git reflog, then && git rebase -i HEAD~3, then && a signed commit with any message in quotes.`,
            hintUnlocksAfterAttempts: 1,
            battle: {
                expected: `git bisect good ${GOOD_HASH} && git reflog && git rebase -i HEAD~3 && git commit -S -m "Operation Shadow Breach closed"`,
                hint: `Chain in this exact order: git bisect good ${GOOD_HASH}, then && git reflog, then && git rebase -i HEAD~3, then && a signed commit with any message in quotes.`,
            },
        },
    },
];

// ── Seed function ─────────────────────────────────────────────

async function seedMissions() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔ Connected to MongoDB');

    // Clear existing data
    await Level.deleteMany({});
    await Mission.deleteMany({});
    await Command.deleteMany({});
    console.log('✔ Cleared existing levels, missions, commands');

    // Insert levels
    const insertedLevels = await Level.insertMany(levels);
    console.log(`✔ Inserted ${insertedLevels.length} levels`);

    // Map levelNumber → _id
    const levelMap = {};
    insertedLevels.forEach(l => { levelMap[l.levelNumber] = l._id; });

    // Insert missions and commands
    let missionCount = 0;
    let commandCount = 0;

    // Level number per mission index (10 missions per level, in array order)
    const levelForMission = (i) => i < 10 ? 1 : i < 20 ? 2 : 3;

    for (let i = 0; i < missionData.length; i++) {
        const { mission, command } = missionData[i];
        const levelNumber = levelForMission(i);
        const levelId = levelMap[levelNumber];

        const insertedMission = await Mission.create({ ...mission, levelId });
        missionCount++;

        await Command.create({ ...command, missionId: insertedMission._id });
        commandCount++;
    }

    console.log(`✔ Inserted ${missionCount} missions`);
    console.log(`✔ Inserted ${commandCount} commands`);
    console.log('✔ Database seeded successfully');

    await mongoose.disconnect();
    process.exit(0);
}

seedMissions().catch(err => {
    console.error('✘ Seed error:', err);
    process.exit(1);
});