export const m1l4 = {
  id: 'M1L4',
  cmd: 'git add',
  diff: 'easy',
  title: 'git add',
  subtitle: 'Stage your changes for the next commit',
  briefing: `Intelligence has picked up modified files in your local repo. Before you can commit evidence to the secure log, you need to stage the files — telling Git exactly what to include. This is your "load the weapon before firing" step.`,
  sections: [
    {
      heading: 'What it does',
      body: `git add moves changes from your working directory into the staging area. Think of the staging area as a holding zone — nothing gets committed until you explicitly add it first.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git add <filename>', desc: 'Stage a single file' },
        { code: 'git add .', desc: 'Stage everything in the current directory' },
        { code: 'git add -p', desc: 'Interactively choose which changes to stage (chunk by chunk)' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git status', comment: '# see what changed' },
        { output: 'modified:   mission_log.txt\nuntracked:  payload.sh' },
        { prompt: '$', cmd: 'git add mission_log.txt' },
        { prompt: '$', cmd: 'git status', comment: '# check again' },
        { output: 'Changes to be committed:\n  modified: mission_log.txt' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'git add . stages everything including files you might not want committed — always check git status first.',
        'Adding a file doesn\'t save it permanently — you still need git commit after.',
      ],
    },
  ],
  battle: {
    scenario: `You updated attack-report.txt with details about a newly discovered command server. Your handler says: "Stage only that file for now."`,
    expected: 'git add attack-report.txt',
    reject: [
      { cmd: 'git add .', message: 'That stages EVERYTHING in the directory \u2014 this scenario asks you to stage only the one evidence file, by name.' },
      { cmd: 'git add -A', message: 'That stages every change in the repository \u2014 stage only the one evidence file, by name.' },
    ],
    hint: 'Stage a single specific file, not everything.',
  },
}