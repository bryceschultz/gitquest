export const m1fa = {
  id: 'M1FA',
  cmd: 'FIELD ASSIGNMENT',
  diff: 'easy',
  title: 'Field Assignment: First Day in the Field',
  subtitle: 'Run the complete daily loop, start to finish',
  briefing: `This is it, Agent — your first live operation. HQ has assigned you to the Shadow Breach task force. You'll get the intel, record your findings, and report in. Every step uses a command you've already mastered. Now you run them in sequence, the way you will every working day of your career.`,
  sections: [
    {
      heading: 'Your objective',
      body: `Complete one full daily cycle: get the repository, check your state, stage your evidence, record it, and share it with HQ. No hints about which command comes next — the sequence IS the lesson.`,
    },
    {
      heading: 'Remember the loop',
      body: `Get code → check state → stage → record → share. If you can run this loop without thinking, you can survive day one on any software team in the world.`,
    },
  ],
  battle: {
    type: 'sequence',
    steps: [
      {
        objective: 'Get the intel',
        scenario: `You've been assigned to the operation. Get a complete local copy of the task force repository at https://github.com/us-cyber/shadow-breach.git.`,
        expected: 'git clone https://github.com/us-cyber/shadow-breach.git',
        accept: ['git clone https://github.com/us-cyber/shadow-breach.git'],
        hint: 'The command that copies a remote repository to your machine.',
        success: 'Repository secured. You now have the full case file locally.',
      },
      {
        objective: 'Check your state',
        scenario: `You've added your first findings to attack-report.txt. Before doing anything else, confirm what Git sees as changed.`,
        expected: 'git status',
        accept: ['git status'],
        hint: 'Always know your state before you act.',
        success: 'One modified file: attack-report.txt. Exactly as expected.',
      },
      {
        objective: 'Stage the evidence',
        scenario: `Stage attack-report.txt — and only that file — for the next commit.`,
        expected: 'git add attack-report.txt',
        accept: ['git add attack-report.txt'],
        reject: [
          { cmd: 'git add .', message: 'That stages EVERYTHING in the directory — including files you haven\u2019t reviewed. Stage the specific file HQ asked for.' },
        ],
        hint: 'Stage the one named file.',
        success: 'Evidence staged. Ready to go on the record.',
      },
      {
        objective: 'Record your findings',
        scenario: `Commit the staged evidence with a message describing what you found.`,
        expected: 'git commit -m "Initial findings on Shadow Breach"',
        accept: ['git commit -m <message>'],
        hint: 'Commit with a -m message in quotes.',
        success: 'Findings committed to the local record.',
      },
      {
        objective: 'Report in',
        scenario: `Your commit exists only on your machine. Share it with HQ by sending it to the remote repository.`,
        expected: 'git push',
        accept: ['git push', 'git push origin main'],
        hint: 'The loop isn\u2019t complete until HQ can see your work.',
        success: 'Report received by HQ. Daily loop complete.',
      },
    ],
  },
}
