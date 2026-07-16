export const m4l6 = {
  id: 'M4L6',
  cmd: 'git bisect good',
  diff: 'hard',
  title: 'git bisect good',
  subtitle: 'Clear a suspect from the investigation',
  briefing: `You've tested a commit from three weeks ago and confirmed everything was working correctly at that point. Report your findings to narrow the search.`,
  sections: [
    {
      heading: 'What it does',
      body: `During the bisect process, you've checked out a commit and confirmed the system works correctly at this point. You need to tell Git so it can narrow the search. git bisect good marks the current (or specified) commit as working, guiding the binary search closer to the bad commit. Think of it as clearing an agent from suspicion during an internal investigation.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git bisect good', desc: 'Mark the currently checked-out commit as working' },
        { code: 'git bisect good a1b2c3d', desc: 'Mark a specific commit as working' },
        { code: 'git bisect bad', desc: 'The counterpart — mark a commit as broken' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git bisect good a1b2c3d' },
        { output: 'Bisecting: 12 revisions left to test after this (roughly 4 steps)\n[8c3d02e] Refactor mission tracker storage' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Each good/bad answer halves the search space — answer honestly or the hunt converges on the wrong commit.',
        'When Git announces the first bad commit, that\u2019s your culprit. Then git bisect reset.',
      ],
    },
  ],
  battle: {
    scenario: `You've confirmed that commit a1b2c3d works correctly during a bisect session. What command marks it as good?`,
    expected: 'git bisect good a1b2c3d',
    accept: ['git bisect good a1b2c3d'],
    hint: 'Same bisect command family — mark the hash as good.',
  },
}
