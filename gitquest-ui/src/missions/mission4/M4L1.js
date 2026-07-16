export const m4l1 = {
  id: 'M4L1',
  cmd: 'git cherry-pick',
  diff: 'hard',
  title: 'git cherry-pick',
  subtitle: 'Extract one page from another case file',
  briefing: `An agent on a separate branch has cracked part of Shadow Breach's encryption. You need that fix in your branch immediately — without merging everything else they've worked on.`,
  sections: [
    {
      heading: 'What it does',
      body: `A fellow agent on a different branch made one specific commit containing a critical decryption fix. You need only that one commit, not the entire branch. git cherry-pick applies a single specific commit from anywhere in the history onto your current branch. Think of it as extracting one page from another agent's case file and adding it to yours.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git cherry-pick a1b2c3d', desc: 'Apply commit a1b2c3d onto the current branch' },
        { code: 'git log other-branch --oneline', desc: 'Find the hash of the commit you need first' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git cherry-pick a1b2c3d' },
        { output: '[main 7d21f4b] Crack relay-node encryption keys\n 1 file changed, 22 insertions(+)' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Cherry-picking COPIES the commit — the same change now exists as two different commits in two branches.',
        'If the commit touches lines your branch also changed, you\u2019ll need to resolve a conflict.',
      ],
    },
  ],
  battle: {
    scenario: `You know the commit hash of the fix you need — a1b2c3d. What command applies just that one commit to your current branch?`,
    expected: 'git cherry-pick a1b2c3d',
    accept: ['git cherry-pick a1b2c3d'],
    reject: [
      { cmd: 'git merge feature-branch', message: 'A merge brings EVERYTHING from that branch. The mission is to extract exactly one commit — nothing else.' },
    ],
    hint: 'The command is named after picking a single fruit off a tree. Follow it with the hash.',
  },
}
