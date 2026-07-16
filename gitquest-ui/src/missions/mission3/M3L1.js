export const m3l1 = {
  id: 'M3L1',
  cmd: 'git branch',
  diff: 'med',
  title: 'git branch',
  subtitle: 'Create a new, independent line of development',
  briefing: `HQ wants you to test a decoy operation to lure Shadow Breach into a trap, but you can't risk corrupting the main investigation. Create a separate branch for the operation.`,
  sections: [
    {
      heading: 'What it does',
      body: `git branch creates a new branch — an independent line of development that doesn't affect the main codebase until you're ready to merge. Think of it as opening a parallel case file that stays separate until cleared.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git branch <branch-name>', desc: 'Create a new branch off the current one' },
        { code: 'git branch', desc: 'List all local branches' },
        { code: 'git branch -d <branch-name>', desc: 'Delete a branch that\'s already merged' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git branch decoy-operation' },
        { prompt: '$', cmd: 'git branch', comment: '# confirm it was created' },
        { output: '  decoy-operation\n* main' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'git branch only creates the branch — it doesn\'t switch you into it. You\'ll still be on main.',
        'Branch names with spaces will cause errors — use hyphens instead, like decoy-operation.',
      ],
    },
  ],
  battle: {
    scenario: `You need to create a new branch called decoy-operation to safely develop a countermeasure. What command do you use?`,
    expected: 'git branch decoy-operation',
    reject: [
      { cmd: 'git checkout -b decoy-operation', message: 'That creates the branch AND switches to it in one move \u2014 this step only creates the branch. Switching comes next lesson.' },
      { cmd: 'git switch -c decoy-operation', message: 'That creates the branch AND switches to it in one move \u2014 this step only creates the branch. Switching comes next lesson.' },
    ],
    hint: 'git branch followed by the new branch name.',
  },
}