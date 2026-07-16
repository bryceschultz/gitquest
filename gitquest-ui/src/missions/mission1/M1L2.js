export const m1l2 = {
  id: 'M1L2',
  cmd: 'git pull',
  diff: 'easy',
  title: 'git pull',
  subtitle: 'Sync your local repo with the latest remote changes',
  briefing: `While reviewing intelligence reports, HQ receives new evidence from agents overseas. Shadow Breach has changed its attack plans, and your local files are now outdated. You need to sync up before continuing.`,
  sections: [
    {
      heading: 'What it does',
      body: `git pull downloads the latest changes from the remote repository and merges them into your local copy. Think of it as receiving the latest classified briefing from headquarters before continuing your investigation.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git pull', desc: 'Fetch and merge changes from the tracked remote branch' },
        { code: 'git pull origin main', desc: 'Fetch and merge from a specific remote and branch' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git pull' },
        { output: 'Updating a1b2c3d..e4f5g6h\nFast-forward\n  attack-strategy.txt | 12 ++++++++----\n  1 file changed, 8 insertions(+), 4 deletions(-)' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'If you have uncommitted local changes that conflict with incoming updates, git pull can fail or trigger a merge conflict.',
        'git pull is essentially git fetch + git merge — know what you\'re merging into.',
      ],
    },
  ],
  battle: {
    scenario: `Another cyber agent has uploaded new intelligence identifying the hackers' next target. What command should you use to update your local repository?`,
    expected: 'git pull',
    hint: 'One word after git — no arguments needed.',
  },
}

