export const m4l2 = {
  id: 'M4L2',
  cmd: 'git merge --squash',
  diff: 'hard',
  title: 'git merge --squash',
  subtitle: 'Condense field notes into one polished report',
  briefing: `A completed feature branch has dozens of noisy work-in-progress commits. Collapse all of those changes into a single clean commit before adding them to the main investigation record.`,
  sections: [
    {
      heading: 'What it does',
      body: `A feature branch has 15 small, messy commits that clutter the history. Before merging into main, you want to collapse them into a single clean commit. git merge --squash brings all the changes from a branch into your working directory as staged changes, ready to be committed as one. Think of it as condensing an entire agent's field notes into a single polished summary report.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git merge --squash feature-branch', desc: 'Stage every change from the branch as one pending commit' },
        { code: 'git commit -m "Add feature"', desc: 'Then commit them as a single entry — squash does NOT auto-commit' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git merge --squash feature-branch' },
        { output: 'Squash commit -- not updating HEAD\nAutomatic merge went well; stopped before committing as requested' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Unlike a normal merge, --squash stops BEFORE committing — you must run git commit yourself.',
        'The squashed commit has no history link to the branch, so Git won\u2019t know the branch was "merged" — delete it with -D once done.',
      ],
    },
  ],
  battle: {
    scenario: `You want to bring in all changes from feature-branch as a single commit rather than preserving every individual commit. What command stages all those changes at once?`,
    expected: 'git merge --squash feature-branch',
    accept: ['git merge --squash feature-branch'],
    reject: [
      { cmd: 'git merge feature-branch', message: 'A plain merge preserves all 15 noisy commits in the record. Add the flag that flattens them into one.' },
    ],
    hint: 'A merge with the flag that means "flatten it."',
  },
}
