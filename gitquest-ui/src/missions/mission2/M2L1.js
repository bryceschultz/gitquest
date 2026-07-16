export const m2l1 = {
  id: 'M2L1',
  cmd: 'git log',
  diff: 'med',
  title: 'git log',
  subtitle: 'Review the full commit history',
  briefing: `A new analyst has joined your team and suspects a mole tampered with the repository weeks ago. Review the full commit history to identify any suspicious activity.`,
  sections: [
    {
      heading: 'What it does',
      body: `git log displays the full history of commits — who made them, when, and with what message. Think of it as reading through the agency's investigation timeline from the very beginning.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git log', desc: 'Show the full commit history, most recent first' },
        { code: 'git log --oneline', desc: 'Show a condensed one-line-per-commit view' },
        { code: 'git log -p', desc: 'Show the actual changes introduced in each commit' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git log --oneline' },
        { output: '9f8e7d6 Discovered Shadow Breach command server\ne4f5g6h Updated attack strategy notes\na1b2c3d Initial intelligence upload' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'git log can produce a long output — pipe it or use --oneline to keep it readable.',
        'Press q to exit the log view if it opens in a pager and seems "stuck".',
      ],
    },
  ],
  battle: {
    scenario: `You need to see every change ever committed to the repository, along with who made it and when. What command do you run?`,
    expected: 'git log',
    hint: 'One word after git — no arguments needed.',
  },
}