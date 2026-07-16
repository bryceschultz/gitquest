export const m1l3 = {
  id: 'M1L3',
  cmd: 'git status',
  diff: 'easy',
  title: 'git status',
  subtitle: 'Check what has changed in your working directory',
  briefing: `Before taking any action, a good agent always checks what's changed. Before filing your next report, you need to know exactly which files have been modified and which are ready to submit. Run a field status check on your investigation folder.`,
  sections: [
    {
      heading: 'What it does',
      body: `git status shows which files have been modified, staged, or are untracked. Think of it as a quick field report — a snapshot of what's happened in your working directory since your last commit.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git status', desc: 'Show the state of the working directory and staging area' },
        { code: 'git status -s', desc: 'Show a shorter, more compact status output' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git status' },
        { output: 'On branch main\nChanges not staged for commit:\n  modified: field_report.txt\n\nUntracked files:\n  new_intel.txt' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'git status doesn\'t change anything — it\'s purely informational, so it\'s always safe to run.',
        'Untracked files won\'t be included in a commit until you git add them first.',
      ],
    },
  ],
  battle: {
    scenario: `You've been editing several files and want to see which ones are staged, which are modified, and which are new. What command gives you that overview?`,
    expected: 'git status',
    hint: 'One word after git — no arguments needed.',
  },
}