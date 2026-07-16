export const m3l4 = {
  id: 'M3L4',
  cmd: 'git stash pop',
  diff: 'med',
  title: 'git stash pop',
  subtitle: 'Retrieve your shelved work',
  briefing: `The emergency has been handled. Retrieve your previously saved work so you can finish the investigation you had to pause.`,
  sections: [
    {
      heading: 'What it does',
      body: `The urgent assignment is done. Now it's time to retrieve your shelved work and continue where you left off. git stash pop restores the most recently stashed changes back into your working directory and removes them from the stash. Think of it as unlocking that drawer and picking up exactly where you left off.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git stash pop', desc: 'Restore the latest stash and remove it from the stash list' },
        { code: 'git stash apply', desc: 'Restore the latest stash but KEEP it in the stash list' },
        { code: 'git stash pop stash@{2}', desc: 'Restore a specific older stash' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git stash pop' },
        { output: 'On branch main\nChanges not staged for commit:\n  modified: attack-report.txt\n\nDropped refs/stash@{0}' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'pop restores AND deletes the stash; apply restores but keeps it. Know which one you want.',
        'If popping causes a conflict, the stash is NOT dropped — resolve the conflict, then drop it manually.',
      ],
    },
  ],
  battle: {
    scenario: `You previously stashed your in-progress changes. What command restores them back to your working directory?`,
    expected: 'git stash pop',
    accept: ['git stash pop'],
    reject: [
      { cmd: 'git stash apply', message: 'Close — apply also restores the work, but it leaves a copy sitting in the stash list. This mission asks for the command that restores AND removes it.' },
      { cmd: 'git stash', message: 'That shelves work. You want the opposite — bringing shelved work back.' },
    ],
    hint: 'Same command as last lesson, plus one word that means "take it off the stack."',
  },
}
