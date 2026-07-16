export const m2fa = {
  id: 'M2FA',
  cmd: 'FIELD ASSIGNMENT',
  diff: 'med',
  title: 'Field Assignment: The Contaminated Report',
  subtitle: 'Diagnose the damage, then choose the RIGHT undo',
  briefing: `Crisis at HQ. A report in the repository has been contaminated with false intelligence — some of it committed and already pushed, some still sitting uncommitted in your working directory. Your job: inspect the record, figure out what happened, and undo each problem with the correct tool from the Undo Ladder. Using the wrong undo makes things worse.`,
  sections: [
    {
      heading: 'Your objective',
      body: `Work the incident end to end: read the history, inspect the changes, discard the bad working-directory edit, record and fix your own commit, and safely reverse the contaminated commit that was already pushed.`,
    },
    {
      heading: 'The Undo Ladder — choose by blast radius',
      body: `amend fixes your last LOCAL commit. restore discards uncommitted file changes. revert safely undoes a PUSHED commit with a new commit. reset --hard erases a LOCAL commit entirely. The skill isn't knowing the commands — it's choosing the right one.`,
    },
  ],
  battle: {
    type: 'sequence',
    steps: [
      {
        objective: 'Read the record',
        scenario: `Something is wrong with the intel. Start by viewing the commit history to see what was recently recorded.`,
        expected: 'git log',
        accept: ['git log'],
        hint: 'History first. You can\u2019t fix what you haven\u2019t read.',
        success: 'There it is — a suspicious commit: "Update source list" pushed an hour ago. And your working directory shows an uncommitted change too.',
      },
      {
        objective: 'Inspect the uncommitted change',
        scenario: `Before touching anything, see the exact line-by-line changes sitting uncommitted in your working directory.`,
        expected: 'git diff',
        accept: ['git diff'],
        hint: 'Compare the working directory to the last commit.',
        success: 'Confirmed: intel-notes.txt contains fabricated coordinates. It was never committed — good.',
      },
      {
        objective: 'Discard the bad working change',
        scenario: `The uncommitted edit to intel-notes.txt is contamination. Discard it and return the file to its last committed state.`,
        expected: 'git restore intel-notes.txt',
        accept: ['git restore intel-notes.txt', 'git checkout -- intel-notes.txt'],
        reject: [
          { cmd: 'git reset --hard HEAD~1', message: 'Massive overkill — that erases an entire COMMIT. This contamination was never committed; you only need to discard a working-directory change to one file.' },
        ],
        hint: 'Lowest rung of the ladder: an uncommitted file change.',
        success: 'File restored to its last clean committed state.',
      },
      {
        objective: 'Record your incident findings',
        scenario: `Document what you found. Your notes are staged in incident-log.txt — commit them with a message.`,
        expected: 'git commit -m "Document contamination incident"',
        accept: ['git commit -m <message>'],
        hint: 'A normal commit with a message.',
        success: 'Incident documented... but you typo\u2019d the report. HQ standards require a clean amendment.',
      },
      {
        objective: 'Fix your last commit',
        scenario: `You forgot to include one staged detail in that commit, and it hasn't been pushed. Fold the staged change into the previous commit without changing its message.`,
        expected: 'git commit --amend --no-edit',
        accept: ['git commit --amend --no-edit'],
        reject: [
          { cmd: 'git revert HEAD', message: 'revert would ADD a new commit undoing your notes entirely. You just want to fix your own last LOCAL commit — one rung down the ladder.' },
        ],
        hint: 'Your last commit, local only, message unchanged.',
        success: 'Commit amended cleanly. Now for the real problem.',
      },
      {
        objective: 'Reverse the pushed contamination',
        scenario: `The contaminated "Update source list" commit is at HEAD~1... after your fixes, it's the most recent shared commit at HEAD on the remote. It was ALREADY PUSHED — the whole team has it. Undo it safely, keeping history intact.`,
        expected: 'git revert HEAD',
        accept: ['git revert HEAD'],
        reject: [
          { cmd: 'git reset --hard HEAD~1', message: 'NEVER erase a PUSHED commit — every agent\u2019s copy would break. Pushed history gets reversed with a new commit, not rewritten.' },
        ],
        hint: 'The safe undo for commits the team already has.',
        success: 'Contamination reversed on the record, history intact. HQ commends your judgment — right tool, every time.',
      },
    ],
  },
}
