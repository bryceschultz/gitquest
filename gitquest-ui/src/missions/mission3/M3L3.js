export const m3l3 = {
  id: 'M3L3',
  cmd: 'git stash',
  diff: 'med',
  title: 'git stash',
  subtitle: 'Shelve unfinished work without committing',
  briefing: `HQ needs you to drop everything and investigate a new threat immediately. Your current work is incomplete — save it somewhere safe without committing it.`,
  sections: [
    {
      heading: 'What it does',
      body: `An urgent new assignment just came in, but your current work isn't ready to commit. git stash temporarily shelves all your uncommitted changes so you can switch focus, then come back to them later. Think of it as locking your unfinished case notes in a drawer before rushing to a briefing.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git stash', desc: 'Shelve all uncommitted changes and clean the working directory' },
        { code: 'git stash list', desc: 'See everything currently stashed' },
        { code: 'git stash pop', desc: 'Restore the most recent stash (next lesson)' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git stash' },
        { output: 'Saved working directory and index state WIP on main: 4f2a91c Discovered Shadow Breach command server' },
        { prompt: '$', cmd: 'git status' },
        { output: 'On branch main\nnothing to commit, working tree clean' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'By default, git stash does NOT include untracked (brand-new) files — use git stash -u to include them.',
        'Stashes are local only. They never get pushed to the remote.',
      ],
    },
  ],
  battle: {
    scenario: `You have unstaged changes in progress and need a clean working directory right now. What command temporarily saves your work without creating a commit?`,
    expected: 'git stash',
    accept: ['git stash'],
    reject: [
      { cmd: 'git commit -m <message>', message: 'A commit makes your half-finished work part of the permanent record. HQ said save it WITHOUT committing.' },
      { cmd: 'git restore .', message: 'That would DESTROY your in-progress work, not save it. You need to shelve it, not discard it.' },
    ],
    hint: 'Think of a place you\u2019d temporarily hide something — one word after git.',
  },
}
