export const m4l5 = {
  id: 'M4L5',
  cmd: 'git bisect start',
  diff: 'hard',
  title: 'git bisect start',
  subtitle: 'Begin the interrogation',
  briefing: `The mission tracking system stopped working sometime in the last two months and no one noticed until now. Use a binary search through the commit history to identify the exact commit that introduced the failure.`,
  sections: [
    {
      heading: 'What it does',
      body: `Somewhere in the last 50 commits, a critical bug was introduced that corrupted the mission tracker — and you don't know which commit caused it. git bisect performs a binary search through commit history, letting you mark commits as good or bad until the culprit is identified. Think of it as systematically interrogating every agent who touched the file until you find the one who made the mistake.`,
    },
    {
      heading: 'The workflow',
      blocks: [
        { code: 'git bisect start', desc: 'Begin a bisect session' },
        { code: 'git bisect bad', desc: 'Mark the current (broken) commit as bad' },
        { code: 'git bisect good a1b2c3d', desc: 'Mark a known-working commit — Git checks out the midpoint' },
        { code: 'git bisect reset', desc: 'End the session and return to where you started' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git bisect start' },
        { output: 'status: waiting for both good and bad commits' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Binary search is fast: 50 commits take about 6 test rounds, not 50.',
        'Always finish with git bisect reset, or you\u2019ll be left detached mid-history.',
      ],
    },
  ],
  battle: {
    scenario: `You need to begin a binary search through commit history to find a bug. What command starts the process?`,
    expected: 'git bisect start',
    accept: ['git bisect start'],
    reject: [
      { cmd: 'git log', message: 'Reading 50 commits one by one is exactly what bisect saves you from. Start the binary search instead.' },
    ],
    hint: 'The command name means "cut in two" — then tell it to start.',
  },
}
