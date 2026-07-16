export const m2l6 = {
  id: 'M2L6',
  cmd: 'git reset --hard',
  diff: 'med',
  title: 'git reset --hard',
  subtitle: 'Destroy the draft before it leaves your desk',
  briefing: `You committed to the wrong branch entirely — before pushing. Erase the last commit completely and return your workspace to its previous clean state.`,
  sections: [
    {
      heading: 'What it does',
      body: `A commit was made locally that was a complete mistake: wrong branch, wrong files, wrong message. Since it hasn't been pushed yet, you can erase it entirely. git reset --hard HEAD~1 moves your branch back one commit and discards all changes completely. Think of it as physically destroying a draft report before it ever leaves your desk.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git reset --hard HEAD~1', desc: 'Erase the last commit AND all of its changes' },
        { code: 'git reset --soft HEAD~1', desc: 'Remove the commit but keep its changes staged' },
        { code: 'git reset HEAD~1', desc: 'Remove the commit, keep changes unstaged (--mixed, the default)' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git reset --hard HEAD~1' },
        { output: 'HEAD is now at 4f2a91c Discovered Shadow Breach command server' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        '--hard is DESTRUCTIVE: uncommitted changes and the erased commit\u2019s work are gone from your working directory.',
        'Only reset commits that have NOT been pushed. For pushed commits, use git revert instead (previous lesson).',
      ],
    },
  ],
  battle: {
    scenario: `You need to completely remove the most recent local commit and discard all its changes. What command does this?`,
    expected: 'git reset --hard HEAD~1',
    accept: ['git reset --hard HEAD~1'],
    reject: [
      { cmd: 'git revert HEAD', message: 'revert would ADD a correction commit — the mistake would still sit in your history. This commit was never pushed, so it can be erased outright.' },
      { cmd: 'git reset --soft HEAD~1', message: '--soft keeps all the mistaken changes staged. The mission says discard them completely.' },
    ],
    hint: 'reset, the flag that means "no mercy," and HEAD~1 (one commit back).',
  },
}
