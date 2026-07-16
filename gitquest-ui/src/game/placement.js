// Placement assessment for the Field agent route (S3-02, FR-06).
//
// A short scored multiple-choice quiz. Scoring is a pure function; the 75%
// threshold (approved policy) decides whether the learner is recommended to
// start at Mission 2 (Damage Control) or at the beginning. Field agents keep free
// navigation regardless — the placement result is a recommendation.

export const PLACEMENT_THRESHOLD = 0.75

export const PLACEMENT_QUESTIONS = [
  {
    id: 'q1',
    prompt: 'You need a complete local copy of a remote repository you\u2019ve never worked with before. Which command?',
    choices: ['git pull', 'git clone <url>', 'git fetch <url>', 'git init'],
    answer: 1,
    explanation: 'git clone copies an entire remote repository (files + history) to your machine for the first time. pull and fetch update a repository you already have; init creates a brand-new empty one.',
  },
  {
    id: 'q2',
    prompt: 'You edited a file but have NOT staged it. Which command shows the exact line-by-line changes compared to the last commit?',
    choices: ['git status', 'git diff', 'git log', 'git show'],
    answer: 1,
    explanation: 'git diff compares your working directory to the last commit line by line. git status only lists which files changed, and git log shows commit history.',
  },
  {
    id: 'q3',
    prompt: 'You want to stage exactly one file, evidence.txt, for the next commit. Which command?',
    choices: ['git add .', 'git commit evidence.txt', 'git add evidence.txt', 'git stage --all'],
    answer: 2,
    explanation: 'git add <file> stages that specific file. git add . stages everything in the directory, which is not what was asked.',
  },
  {
    id: 'q4',
    prompt: 'What does git commit -m "message" do?',
    choices: [
      'Uploads your changes to the remote server',
      'Creates a permanent snapshot of staged changes with a message',
      'Saves your file in the editor',
      'Merges the message into the main branch',
    ],
    answer: 1,
    explanation: 'commit records the currently staged changes as a snapshot in history; -m attaches the message inline. Nothing is sent to the remote until you push.',
  },
  {
    id: 'q5',
    prompt: 'Which command shows which files are modified, staged, or untracked right now?',
    choices: ['git log', 'git show', 'git status', 'git diff --history'],
    answer: 2,
    explanation: 'git status reports the current state of the working directory and staging area. git log shows commit history, not working-tree state.',
  },
  {
    id: 'q6',
    prompt: 'You want to create a branch called recon WITHOUT switching to it. Which command?',
    choices: ['git checkout -b recon', 'git branch recon', 'git switch recon', 'git branch -d recon'],
    answer: 1,
    explanation: 'git branch <name> only creates the branch. checkout -b (and switch -c) create AND switch; switch alone moves to an existing branch; branch -d deletes one.',
  },
  {
    id: 'q7',
    prompt: 'An uncommitted change to notes.txt turned out to be wrong. Which command discards it and restores the file to its last committed state?',
    choices: ['git reset --hard origin', 'git rm notes.txt', 'git restore notes.txt', 'git revert notes.txt'],
    answer: 2,
    explanation: 'git restore <file> reverts an uncommitted file to its last committed state. git revert targets commits (not files), and reset --hard would wipe ALL your changes, not just this file.',
  },
  {
    id: 'q8',
    prompt: 'You are on branch feature and run git rebase main. What happens?',
    choices: [
      'main\u2019s commits are deleted',
      'feature\u2019s unique commits are replayed on top of the latest main',
      'feature is merged into main with a merge commit',
      'Nothing until you run git rebase --continue',
    ],
    answer: 1,
    explanation: 'Rebase moves your branch to the tip of main and re-applies your commits on top, producing a linear history. A merge commit is what git merge would create instead.',
  },
]

// answers: { [questionId]: chosenIndex }
export function scorePlacement(answers, questions = PLACEMENT_QUESTIONS) {
  const total = questions.length
  const correct = questions.filter(q => answers?.[q.id] === q.answer).length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const passed = total > 0 && correct / total >= PLACEMENT_THRESHOLD
  return {
    correct,
    total,
    pct,
    passed,
    recommendedMission: passed ? 'M2' : 'M1',
  }
}
