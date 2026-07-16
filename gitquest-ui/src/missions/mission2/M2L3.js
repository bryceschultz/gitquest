export const m2l3 = {
  id: 'M2L3',
  cmd: 'git commit --amend --no-edit',
  diff: 'med',
  title: 'git commit --amend --no-edit',
  subtitle: 'Update the most recent commit without changing its message',
  briefing: `Minutes after submitting your report, another analyst notices that an important forensic log file was accidentally omitted. Fortunately, the report hasn't been archived yet — you can still fix it.`,
  sections: [
    {
      heading: 'What it does',
      body: `git commit --amend --no-edit updates the most recent commit with any newly staged changes, without changing its commit message. Think of it as attaching missing evidence to a report that was already submitted, before it goes any further up the chain.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git commit --amend --no-edit', desc: 'Add staged changes to the last commit, keep the existing message' },
        { code: 'git commit --amend', desc: 'Add staged changes to the last commit and open the editor to change the message' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git add forensic_log.txt', comment: '# stage the missing file' },
        { prompt: '$', cmd: 'git commit --amend --no-edit' },
        { output: '[main 3c2b1a0] Discovered Shadow Breach command server\n Date: Thu Jul 2 12:00:00 2026\n 2 files changed, 6 insertions(+)' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Amending rewrites the last commit\'s hash — never amend a commit that\'s already been pushed and shared with others.',
        'Forgetting --no-edit will drop you into a text editor to change the commit message.',
      ],
    },
  ],
  battle: {
    scenario: `A forensic log containing proof of the hackers' activities was accidentally left out of your most recent report. You've staged the missing file and want to add it to your last commit while keeping the existing commit message.`,
    expected: 'git commit --amend --no-edit',
    reject: [
      { cmd: 'git commit --amend', message: 'Close \u2014 but plain --amend opens the editor to change the message. The scenario says the message must stay untouched; there\u2019s a flag for that.' },
    ],
    hint: 'Amend the last commit, but skip the message editor.',
  },
}