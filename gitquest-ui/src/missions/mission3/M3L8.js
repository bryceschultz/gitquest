export const m3l8 = {
  id: 'M3L8',
  cmd: 'git rebase',
  diff: 'med',
  title: 'git rebase',
  subtitle: 'Replay your branch\u2019s commits on top of another branch',
  briefing: `While you worked on the intel-analysis branch, main moved ahead with new agency-wide changes. Before your analysis can be reviewed, HQ wants your commits replayed on top of the LATEST main — a clean, linear history with no merge commit.`,
  sections: [
    {
      heading: 'What it does',
      body: `git rebase <branch> takes the commits that are unique to your current branch, temporarily sets them aside, moves your branch to the tip of the target branch, and re-applies your commits one by one on top. The result reads like you started your work from the latest code — a straight line of history instead of a merge bubble.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git rebase main', desc: 'Replay the current branch\u2019s commits on top of main' },
        { code: 'git rebase --continue', desc: 'Resume a rebase after resolving a conflict' },
        { code: 'git rebase --abort', desc: 'Cancel the rebase and return to the state before it started' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git checkout intel-analysis' },
        { prompt: '$', cmd: 'git rebase main' },
        { output: 'Successfully rebased and updated refs/heads/intel-analysis.' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Rebase REWRITES history — the replayed commits are new commits with new IDs.',
        'Never rebase commits that others have already based work on (e.g. a shared branch).',
        'If a replayed commit conflicts with the new base, the rebase pauses and asks you to resolve it, then continue with git rebase --continue.',
      ],
    },
  ],
  battle: {
    scenario: `You are on the intel-analysis branch. main has new commits you don\u2019t have. Replay your branch\u2019s commits on top of the latest main so history stays linear.`,
    expected: 'git rebase main',
    hint: 'You\u2019re already on your branch — name the branch you want to replay ON TOP OF.',
  },
}
