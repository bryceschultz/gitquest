export const m4l9 = {
  id: 'M4L9',
  cmd: 'git tag',
  diff: 'hard',
  title: 'git tag',
  subtitle: 'Stamp the milestone',
  briefing: `Your team has completed the first phase of the investigation. Mark this moment in the repository's history so it can always be referenced as the first confirmed breakthrough.`,
  sections: [
    {
      heading: 'What it does',
      body: `Your team has reached a major checkpoint — the first confirmed breach location has been identified and documented. git tag marks a specific commit with a memorable label, making it easy to reference important milestones later. Think of it as stamping a case file with an official seal when a major breakthrough is achieved.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git tag v1.0', desc: 'Create a lightweight tag on the current commit' },
        { code: 'git tag', desc: 'List all existing tags' },
        { code: 'git push origin v1.0', desc: 'Tags don\u2019t push automatically — send them explicitly' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git tag v1.0' },
        { prompt: '$', cmd: 'git tag' },
        { output: 'v1.0' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'git push does NOT send tags by default — use git push origin <tagname> or --tags.',
        'Tags are fixed to a commit. Unlike branches, they don\u2019t move as new commits arrive.',
      ],
    },
  ],
  battle: {
    scenario: `You want to mark the current commit as version 1.0 of the investigation. What command creates that label?`,
    expected: 'git tag v1.0',
    accept: ['git tag v1.0'],
    reject: [
      { cmd: 'git branch v1.0', message: 'A branch keeps moving as commits are added. A milestone needs a permanent, fixed label — that\u2019s a tag.' },
    ],
    hint: 'git tag <label> — the label is v1.0.',
  },
}
