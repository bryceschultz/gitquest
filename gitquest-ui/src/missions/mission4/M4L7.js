export const m4l7 = {
  id: 'M4L7',
  cmd: 'git reflog',
  diff: 'hard',
  title: 'git reflog',
  subtitle: 'Pull the classified surveillance footage',
  briefing: `A junior agent accidentally deleted the branch containing three days of critical intelligence before it was merged. Recover the lost work using Git's hidden activity log.`,
  sections: [
    {
      heading: 'What it does',
      body: `A critical branch was accidentally deleted before being merged. It looks like the work is gone — but Git secretly keeps a log of every action taken in the repository. git reflog shows a full history of where HEAD has pointed, allowing you to recover seemingly lost commits. Think of it as pulling classified surveillance footage that was never supposed to be deleted.`,
    },
    {
      heading: 'The recovery workflow',
      blocks: [
        { code: 'git reflog', desc: 'Find the hash of the lost commit in HEAD\u2019s movement history' },
        { code: 'git checkout -b recovered 8c3d02e', desc: 'Resurrect it onto a new branch' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git reflog' },
        { output: '4f2a91c HEAD@{0}: checkout: moving from intel-thread to main\n8c3d02e HEAD@{1}: commit: Day-3 intelligence summary\nb7e4a19 HEAD@{2}: commit: Day-2 field notes' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'The reflog is LOCAL only — it can\u2019t recover work that existed solely on another machine.',
        'Reflog entries expire (90 days by default). Recover sooner rather than later.',
      ],
    },
  ],
  battle: {
    scenario: `A branch was deleted and the commits appear lost. What command reveals the full history of HEAD movements so you can find and restore the lost commit?`,
    expected: 'git reflog',
    accept: ['git reflog'],
    reject: [
      { cmd: 'git log', message: 'git log only shows commits reachable from current branches — the deleted branch\u2019s commits won\u2019t appear there. You need the log of HEAD itself.' },
    ],
    hint: 'It\u2019s the log of references — the two words are fused into one.',
  },
}
