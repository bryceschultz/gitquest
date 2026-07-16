export const m3l5 = {
  id: 'M3L5',
  cmd: 'git fetch',
  diff: 'med',
  title: 'git fetch',
  subtitle: 'Download remote changes without touching your working files',
  briefing: `Another agent has pushed new intel to the remote, but you're in the middle of delicate local analysis. You need to see what changed on the server WITHOUT letting it merge into — and possibly disrupt — your current work.`,
  sections: [
    {
      heading: 'What it does',
      body: `git fetch downloads new commits, branches, and tags from the remote but does NOT change your working files or your current branch. Your local copy of the remote's state is updated so you can inspect it, compare it, and decide when to merge. This is the safe, look-before-you-leap way to sync.`,
    },
    {
      heading: 'fetch vs. pull',
      comparison: [
        { label: 'git fetch', point: 'Downloads remote changes only. Your files and branch stay exactly as they are. You choose when (or whether) to merge.' },
        { label: 'git pull', point: 'Downloads remote changes AND immediately merges them into your current branch. Convenient, but it changes your files right away.' },
      ],
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git fetch', desc: 'Fetch all updates from the default remote (origin)' },
        { code: 'git fetch origin', desc: 'Explicitly fetch from the origin remote' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git fetch' },
        { output: 'remote: Enumerating objects: 12, done.\nFrom https://github.com/us-cyber/shadow-breach\n   7e83b04..c90d1aa  main -> origin/main' },
        { prompt: '$', cmd: 'git log main..origin/main --oneline', comment: '# inspect what arrived before merging' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'After a fetch your files are unchanged — the new commits sit in origin/<branch> until you merge or rebase.',
        'Fetching often is harmless; it never overwrites your local work.',
      ],
    },
  ],
  battle: {
    scenario: `HQ reports new commits on the remote. Your local analysis must not be disturbed — download the remote changes without merging anything into your working files.`,
    expected: 'git fetch',
    accept: ['git fetch', 'git fetch origin'],
    reject: [
      { cmd: 'git pull', message: 'git pull would download AND immediately merge — the scenario requires your working files to stay untouched. There\u2019s a command that only downloads.' },
    ],
    hint: 'The command that downloads without merging — check the fetch vs. pull comparison above.',
  },
}
