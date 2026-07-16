export const m2l2 = {
  id: 'M2L2',
  cmd: 'git diff',
  diff: 'med',
  title: 'git diff',
  subtitle: 'Compare the evidence line by line',
  briefing: `A file in your working directory has been modified, but you're not sure what changed. Before staging anything, review the exact differences so you can confirm the changes are legitimate.`,
  sections: [
    {
      heading: 'What it does',
      body: `Two versions of the same intelligence file exist — one from yesterday, one from today. git diff shows the differences between your working directory and the last commit, highlighting additions and deletions. Think of it as placing two documents side by side under a magnifying glass to spot what was altered.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git diff', desc: 'Show unstaged changes compared to the last commit' },
        { code: 'git diff --staged', desc: 'Show changes that are already staged for the next commit' },
        { code: 'git diff main decoy-operation', desc: 'Compare two branches' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git diff' },
        { output: 'diff --git a/attack-report.txt b/attack-report.txt\n--- a/attack-report.txt\n+++ b/attack-report.txt\n@@ -1,3 +1,4 @@\n Server logs reviewed.\n-Origin unknown.\n+Origin traced to relay node 7.\n+Escalating to HQ.' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Plain git diff only shows UNSTAGED changes. Once you git add a file, use git diff --staged to see it.',
        'Lines starting with - were removed; lines starting with + were added.',
      ],
    },
  ],
  battle: {
    scenario: `You've edited a file but haven't staged it yet. What command lets you see exactly what lines were added or removed compared to the last commit?`,
    expected: 'git diff',
    accept: ['git diff'],
    reject: [
      { cmd: 'git status', message: 'git status only lists WHICH files changed — it can\u2019t show you the line-by-line differences. You need the command that compares content.' },
      { cmd: 'git log', message: 'git log shows commit history, not the uncommitted changes sitting in your working directory.' },
    ],
    hint: 'The command name literally means "difference" — no arguments needed for unstaged changes.',
  },
}
