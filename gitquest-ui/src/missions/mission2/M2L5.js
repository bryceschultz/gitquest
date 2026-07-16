export const m2l5 = {
  id: 'M2L5',
  cmd: 'git revert',
  diff: 'med',
  title: 'git revert',
  subtitle: 'Undo safely — history stays intact',
  briefing: `The last commit contained sensitive information that should never have been included. Undo it safely while keeping the repository history clean and intact.`,
  sections: [
    {
      heading: 'What it does',
      body: `A commit was just pushed that accidentally exposed a classified source. It needs to be undone immediately — but the history must stay intact. git revert HEAD creates a NEW commit that undoes the changes from the most recent commit without erasing history. Think of it as filing a formal correction notice rather than shredding the original report.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git revert HEAD', desc: 'Create a new commit that undoes the latest commit' },
        { code: 'git revert a1b2c3d', desc: 'Undo a specific commit from anywhere in history' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git revert HEAD' },
        { output: '[main 9e4f7aa] Revert "Add classified source list"\n 1 file changed, 0 insertions(+), 14 deletions(-)' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'revert is the SAFE undo for commits that were already pushed — teammates\u2019 history is never rewritten.',
        'It undoes one commit\u2019s changes; the original commit remains visible in the log, followed by its correction.',
      ],
    },
  ],
  battle: {
    scenario: `You need to reverse the most recent commit without deleting it from history. What command do you use?`,
    expected: 'git revert HEAD',
    accept: ['git revert HEAD'],
    reject: [
      { cmd: 'git reset --hard HEAD~1', message: 'reset --hard ERASES the commit — and this one was already pushed. Rewriting shared history breaks every other agent\u2019s copy. Use the command that undoes via a new commit.' },
      { cmd: 'git commit --amend --no-edit', message: 'amend edits the last commit\u2019s contents; it doesn\u2019t undo its changes, and it also rewrites pushed history.' },
    ],
    hint: 'The command name means "to return to a previous state" — target HEAD.',
  },
}
