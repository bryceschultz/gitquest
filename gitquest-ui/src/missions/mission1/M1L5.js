export const m1l5 = {
  id: 'M1L5',
  cmd: 'git commit',
  diff: 'easy',
  title: 'git commit',
  subtitle: 'Save your staged changes to the repository history',
  briefing: `The evidence has been reviewed and is ready to become part of the official investigation record. It's time to make it permanent.`,
  sections: [
    {
      heading: 'What it does',
      body: `git commit creates a permanent snapshot of your staged changes and records them in the repository history. The message provided with -m explains what was discovered or changed. Think of it as filing an official intelligence report into the agency archives.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git commit -m "message"', desc: 'Commit staged changes with a short message' },
        { code: 'git commit -am "message"', desc: 'Stage all tracked, modified files and commit in one step' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git add attack-report.txt' },
        { prompt: '$', cmd: 'git commit -m "Discovered Shadow Breach command server"' },
        { output: '[main 9f8e7d6] Discovered Shadow Breach command server\n 1 file changed, 4 insertions(+)' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Only staged changes get committed — anything not added with git add is left out.',
        'Write clear commit messages; "fix stuff" won\'t help anyone reading the mission log later.',
      ],
    },
  ],
  battle: {
    scenario: `You have staged your evidence and are ready to save it to the investigation history. Record it with the message: "Discovered Shadow Breach command server".`,
    expected: 'git commit -m "Discovered Shadow Breach command server"',
    accept: ["git commit -m 'Discovered Shadow Breach command server'"],
    hint: 'Use -m followed by a quoted commit message.',
  },
}