export const m1l6 = {
  id: 'M1L6',
  cmd: 'git push',
  diff: 'easy',
  title: 'git push',
  subtitle: 'Publish your local commits to the shared remote repository',
  briefing: `Your local investigation has produced solid intel — but right now it only exists on your machine. HQ and the other field agents can't see any of it until you publish your commits to the shared remote server.`,
  sections: [
    {
      heading: 'What it does',
      body: `git push uploads your local commits to a remote repository so other agents can see them. It's the opposite of git pull: pull brings remote work down to you, push sends your work up to the team. If you have no new local commits, Git reports "Everything up-to-date" and nothing is sent.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git push', desc: 'Push the current branch to the remote it tracks' },
        { code: 'git push origin main', desc: 'Explicitly push the main branch to the origin remote' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git push' },
        { output: 'Enumerating objects: 5, done.\nWriting objects: 100% (3/3), 342 bytes, done.\nTo https://github.com/us-cyber/shadow-breach.git\n   a1f9c2d..7e83b04  main -> main' },
        { prompt: '$', cmd: 'git push', comment: '# nothing new to send' },
        { output: 'Everything up-to-date' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Push only sends committed work — staged or unsaved changes stay local until you commit them.',
        'If the remote has commits you don\u2019t have, Git rejects the push; pull (or fetch and merge) first, then push again.',
      ],
    },
  ],
  battle: {
    scenario: `You've committed your analysis of the command server locally on main, and the remote hasn't changed since you last synced. HQ needs your commits on the shared server now. Publish your local work.`,
    expected: 'git push',
    accept: ['git push', 'git push origin main'],
    hint: 'One word after git — your branch already tracks the remote.',
  },
}
