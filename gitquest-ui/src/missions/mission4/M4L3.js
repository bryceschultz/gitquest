export const m4l3 = {
  id: 'M4L3',
  cmd: 'git rebase -i',
  diff: 'hard',
  title: 'git rebase -i',
  subtitle: 'Edit the field report before it goes on record',
  briefing: `The last three commits in your local branch have commit messages that are unclear and inconsistent with agency standards. Rewrite them interactively before pushing.`,
  sections: [
    {
      heading: 'What it does',
      body: `Three recent commits were saved with vague, unprofessional messages that don't meet agency documentation standards. Before pushing to the remote, you need to clean them up. git rebase -i opens an interactive editor letting you reword, squash, reorder, or drop commits. Think of it as editing a rough field report into a properly formatted official document before it goes into the permanent record.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git rebase -i HEAD~3', desc: 'Interactively edit the last three commits' },
        { code: 'reword / squash / drop', desc: 'The actions you choose per commit inside the editor' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git rebase -i HEAD~3' },
        { output: 'pick b7e4a19 stuff\npick 8c3d02e more stuff\npick 4f2a91c fix\n\n# Commands:\n# p, pick | r, reword | s, squash | d, drop ...' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Interactive rebase REWRITES history — only use it on commits that haven\u2019t been pushed.',
        'HEAD~3 means "the last three commits." Count carefully; editing the wrong range rewrites the wrong report.',
      ],
    },
  ],
  battle: {
    scenario: `You want to interactively edit the last three commits, rewording messages and cleaning up history. What command opens the interactive rebase editor?`,
    expected: 'git rebase -i HEAD~3',
    accept: ['git rebase -i HEAD~3', 'git rebase --interactive HEAD~3'],
    reject: [
      { cmd: 'git commit --amend --no-edit', message: 'amend only touches the single most recent commit — and keeps its message. Three commits need the interactive editor.' },
    ],
    hint: 'rebase, the flag that makes it interactive, and a range covering three commits back.',
  },
}
