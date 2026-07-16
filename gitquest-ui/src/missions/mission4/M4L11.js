export const m4l11 = {
  id: 'M4L11',
  cmd: 'git archive',
  diff: 'hard',
  title: 'git archive',
  subtitle: 'Seal the evidence vault',
  briefing: `The operation is complete. Package the entire repository at its current state into a zip archive for submission to the classified evidence vault. No Git history should be included.`,
  sections: [
    {
      heading: 'What it does',
      body: `Operation Shadow Breach is over. The agency needs a clean, standalone snapshot of the repository at its final state — no Git history, no branches, just the files — to be archived in the classified evidence vault. git archive exports the contents of a commit as a zip or tar file without any Git metadata. Think of it as sealing the entire case file into a tamper-proof evidence package for permanent storage.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git archive --format=zip HEAD -o shadow-breach-final.zip', desc: 'Export the current commit\u2019s files as a zip' },
        { code: 'git archive --format=tar v1.0 -o phase1.tar', desc: 'Archive any tag or commit, in tar form' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git archive --format=zip HEAD -o shadow-breach-final.zip' },
        { prompt: '$', cmd: 'ls' },
        { output: 'attack-report.txt  decoy-plan.txt  shadow-breach-final.zip' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'The archive contains only the tracked files at that commit — no .git directory, no history, no uncommitted changes.',
        'This is an export, not a backup of the repository. To back up history, clone or push instead.',
      ],
    },
  ],
  battle: {
    scenario: `You need to export the current state of the repository as a zip file named shadow-breach-final.zip for archiving. What command creates that package?`,
    expected: 'git archive --format=zip HEAD -o shadow-breach-final.zip',
    accept: ['git archive --format=zip HEAD -o shadow-breach-final.zip'],
    reject: [
      { cmd: 'git clone https://github.com/us-cyber/shadow-breach.git', message: 'A clone carries the ENTIRE history — the vault requires a snapshot with no Git metadata at all.' },
    ],
    hint: 'archive, the zip format flag, HEAD, and -o with the output filename.',
  },
}
