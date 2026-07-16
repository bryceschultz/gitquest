export const m3l6 = {
  id: 'M3L6',
  cmd: 'git branch -a',
  diff: 'med',
  title: 'git branch -a',
  subtitle: 'Map every active field team',
  briefing: `Several agents have opened new investigation threads simultaneously. Get a complete list of every branch — both local and remote — to assess the full scope of the operation.`,
  sections: [
    {
      heading: 'What it does',
      body: `The investigation has grown, and multiple agents are working on parallel branches. git branch -a lists all branches, including those on the remote server. Think of it as pulling up the full organizational chart of every active field team.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git branch', desc: 'List local branches only' },
        { code: 'git branch -r', desc: 'List remote branches only' },
        { code: 'git branch -a', desc: 'List ALL branches — local and remote' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git branch -a' },
        { output: '* main\n  decoy-operation\n  remotes/origin/main\n  remotes/origin/firewall-hotfix' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'The * marks the branch you\u2019re currently on.',
        'remotes/ entries reflect the remote as of your last fetch/pull — they can be stale.',
      ],
    },
  ],
  battle: {
    scenario: `You want to see every branch that exists in both your local repository and the remote. What command shows them all?`,
    expected: 'git branch -a',
    accept: ['git branch -a', 'git branch --all'],
    reject: [
      { cmd: 'git branch', message: 'That only lists LOCAL branches. You need the flag that includes the remote\u2019s branches too.' },
    ],
    hint: 'Add the flag that means "all" to git branch.',
  },
}
