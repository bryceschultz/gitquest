export const m3l7 = {
  id: 'M3L7',
  cmd: 'git merge',
  diff: 'med',
  title: 'git merge',
  subtitle: 'Fold the covert branch back into the record',
  briefing: `The decoy operation branch contains confirmed intelligence that needs to become part of the official record. Merge it into the main branch.`,
  sections: [
    {
      heading: 'What it does',
      body: `The decoy operation was a success. git merge integrates changes from one branch into your current branch, combining the histories. Think of it as officially folding a covert case file back into the main investigation record.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git checkout main', desc: 'First, move to the branch you\u2019re merging INTO' },
        { code: 'git merge decoy-operation', desc: 'Then bring that branch\u2019s changes into the current branch' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git merge decoy-operation' },
        { output: 'Updating 4f2a91c..8c3d02e\nFast-forward\n decoy-plan.txt | 12 ++++++++++++\n 1 file changed, 12 insertions(+)' },
      ],
    },
    {
      heading: 'In the real world: Pull Requests',
      body: `Professional teams rarely run git merge directly on main. They open a Pull Request (PR) — a reviewed merge on the hosting platform (GitHub, GitLab). A teammate reads the diff, comments, approves, and THEN the platform performs exactly this merge. The command you're learning is what a PR does after approval; the review in front of it is how teams protect the record. HQ protocol: covert work reunifies only after peer sign-off.`,
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Direction matters: you merge the OTHER branch into the one you\u2019re standing on. Check git status first.',
        'If both branches changed the same lines, Git stops and asks you to resolve the conflict before completing the merge.',
      ],
    },
  ],
  battle: {
    scenario: `You are on the main branch and want to bring in the completed work from decoy-operation. What command do you run?`,
    expected: 'git merge decoy-operation',
    accept: ['git merge decoy-operation'],
    reject: [
      { cmd: 'git merge main', message: 'Direction check: you\u2019re already ON main. Merging main into itself does nothing — name the branch whose work you\u2019re bringing in.' },
      { cmd: 'git rebase decoy-operation', message: 'Rebase would rewrite main\u2019s history on top of the decoy branch — the official record should never be rewritten. Use a merge here.' },
    ],
    hint: 'git merge <the branch whose changes you want>.',
  },
}
