export const m4l8 = {
  id: 'M4L8',
  cmd: 'git stash branch',
  diff: 'hard',
  title: 'git stash branch',
  subtitle: 'Reopen a shelved case under a fresh file',
  briefing: `You stashed intelligence while on the wrong branch. Creating a fresh branch from that stash point is the cleanest way to continue without causing conflicts.`,
  sections: [
    {
      heading: 'What it does',
      body: `You stashed work while on the wrong branch, and switching back would cause conflicts. Rather than popping the stash directly, you can create a brand-new branch from the stash, apply it cleanly there, and continue safely. git stash branch creates a new branch from the commit where the stash was made and applies the stash to it. Think of it as reopening a shelved case under a fresh file to avoid contaminating an active one.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git stash branch recovery-branch', desc: 'New branch from the stash point + apply the stash there' },
        { code: 'git stash list', desc: 'Check what\u2019s stashed before recovering it' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git stash branch recovery-branch' },
        { output: 'Switched to a new branch \u2018recovery-branch\u2019\nOn branch recovery-branch\nChanges not staged for commit:\n  modified: intel-notes.txt\nDropped refs/stash@{0}' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'The new branch starts at the commit where you originally stashed — which is exactly why the stash applies without conflicts.',
        'On success the stash is dropped, just like pop.',
      ],
    },
  ],
  battle: {
    scenario: `You want to apply a stash onto a brand new branch called recovery-branch to avoid merge conflicts on your current branch. What command does this?`,
    expected: 'git stash branch recovery-branch',
    accept: ['git stash branch recovery-branch'],
    reject: [
      { cmd: 'git stash pop', message: 'Popping here would dump the stash onto your CURRENT branch — the exact conflict you\u2019re trying to avoid. Recover it onto a fresh branch instead.' },
    ],
    hint: 'Three words after git: the shelf, then what you\u2019re creating, then its name.',
  },
}
