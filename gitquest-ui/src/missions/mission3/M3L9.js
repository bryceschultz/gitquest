export const m3l9 = {
  id: 'M3L9',
  cmd: 'git branch -d',
  diff: 'med',
  title: 'git branch -d',
  subtitle: 'Safely delete a local branch after its work is merged',
  briefing: `The decoy operation is over. Its branch was merged into main, the intel is safe, and leaving stale branches around is bad operational hygiene. Time to clean up your LOCAL copy of the decoy branch — the remote is not your concern in this mission.`,
  sections: [
    {
      heading: 'What it does',
      body: `git branch -d <branch> deletes a LOCAL branch — the copy on your machine only. It does not touch the remote. The lowercase -d is the safe version: Git refuses to delete a branch whose work hasn't been merged yet, so you can't accidentally lose commits. You also can't delete the branch you're currently standing on — switch to another branch (like main) first.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git branch -d <branch-name>', desc: 'Safely delete a merged local branch' },
        { code: 'git branch -D <branch-name>', desc: 'FORCE delete, even if unmerged — can throw away commits' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git checkout main', comment: '# can\u2019t delete the branch you\u2019re on' },
        { prompt: '$', cmd: 'git branch -d decoy-operation' },
        { output: 'Deleted branch decoy-operation (was 3fa2c19).' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'This deletes the LOCAL branch only. Deleting a remote branch is a different operation (git push origin --delete <branch>) and is out of scope here.',
        'Uppercase -D force-deletes even unmerged work — treat it like a loaded weapon.',
        'If Git refuses with "not fully merged", that\u2019s the safety working — merge first or reconsider.',
      ],
    },
  ],
  battle: {
    scenario: `You are on main. The decoy-operation branch has been fully merged and is no longer needed on your machine. Safely delete your local copy of it.`,
    expected: 'git branch -d decoy-operation',
    reject: [
      { cmd: 'git branch -D decoy-operation', message: 'Uppercase -D is the FORCE delete — it would remove the branch even if its work were unmerged. The scenario asks for the safe deletion.' },
      { cmd: 'git push origin --delete decoy-operation', message: 'That deletes the branch on the REMOTE server. This mission is local cleanup only — delete your local copy of the branch.' },
    ],
    hint: 'git branch with the lowercase safe-delete flag, then the branch name.',
  },
}
