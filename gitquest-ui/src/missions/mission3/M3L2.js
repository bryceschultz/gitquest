export const m3l2 = {
  id: 'M3L2',
  cmd: 'git checkout',
  diff: 'med',
  title: 'git checkout',
  subtitle: 'Switch your working environment to another branch',
  briefing: `The decoy branch is ready. Now you need to move your active workspace into it so your work doesn't interfere with the main investigation.`,
  sections: [
    {
      heading: 'What it does',
      body: `git checkout moves your working environment to the specified branch, so any changes you make happen there and not on main. Think of it as physically relocating to a secure off-site facility to run your covert op.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git checkout <branch-name>', desc: 'Switch to an existing branch' },
        { code: 'git checkout -b <branch-name>', desc: 'Create a new branch and switch to it in one step' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git checkout decoy-operation' },
        { output: 'Switched to branch \'decoy-operation\'' },
        { prompt: '$', cmd: 'git status', comment: '# confirm the switch' },
        { output: 'On branch decoy-operation' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Uncommitted changes can sometimes block a checkout — commit or stash them first.',
        'Double-check which branch you\'re on before making changes; it\'s easy to lose track.',
      ],
    },
  ],
  battle: {
    scenario: `You've already created the decoy-operation branch. What command switches your working environment to it?`,
    expected: 'git checkout decoy-operation',
    accept: ['git switch decoy-operation'],
    hint: 'git checkout followed by the branch name.',
  },
}