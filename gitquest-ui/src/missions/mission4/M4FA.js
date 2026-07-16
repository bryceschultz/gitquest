export const m4fa = {
  id: 'M4FA',
  cmd: 'FIELD ASSIGNMENT',
  diff: 'hard',
  title: 'Field Assignment: Operation Complete',
  subtitle: 'The grand finale — surgical history work, then ship it',
  briefing: `This is the endgame, Agent. Shadow Breach's infrastructure is down, and one final intelligence package will finish them. You'll extract a critical fix from another agent's branch, clean the history to agency standards, publish the rewritten history the ONLY safe way, stamp the milestone, and seal the evidence for the classified vault. Everything you've learned, in one operation.`,
  sections: [
    {
      heading: 'Your objective',
      body: `Run the closing sequence: cherry-pick the key fix, clean up the last three commits interactively, force-push safely with a lease, tag the release, and export the final archive.`,
    },
    {
      heading: 'The critical pairing',
      body: `Interactive rebase REWRITES history. Rewritten history can only be published with --force-with-lease — the flag that overwrites the remote ONLY if nobody else pushed in the meantime. These two commands travel together; never run the first without knowing the second.`,
    },
  ],
  battle: {
    type: 'sequence',
    steps: [
      {
        objective: 'Extract the key fix',
        scenario: `Agent Chen cracked the final encryption on her branch. You need exactly her commit a1b2c3d on your branch — nothing else from her branch.`,
        expected: 'git cherry-pick a1b2c3d',
        accept: ['git cherry-pick a1b2c3d'],
        reject: [
          { cmd: 'git merge feature-branch', message: 'A merge brings her ENTIRE branch. The order is one commit: a1b2c3d. Extract exactly that.' },
        ],
        hint: 'One specific commit, by hash.',
        success: 'Decryption fix applied to your branch.',
      },
      {
        objective: 'Clean the record',
        scenario: `Your last three local commits have messy, non-standard messages. Open the interactive editor to reword and clean them before publication.`,
        expected: 'git rebase -i HEAD~3',
        accept: ['git rebase -i HEAD~3', 'git rebase --interactive HEAD~3'],
        hint: 'Interactive, covering three commits back.',
        success: 'History cleaned to agency standards. But you\u2019ve rewritten commits the remote already had...',
      },
      {
        objective: 'Publish rewritten history — safely',
        scenario: `Your local history no longer matches the remote, so a normal push will be rejected. Overwrite the remote branch using the ONLY safe method — the one that aborts if any other agent pushed since your last fetch.`,
        expected: 'git push --force-with-lease',
        accept: ['git push --force-with-lease'],
        reject: [
          { cmd: 'git push --force', message: 'UNSAFE. Plain --force overwrites unconditionally — if another agent pushed in the last minute, their work is destroyed forever. Use the flag with a LEASE.' },
          { cmd: 'git push -f', message: 'UNSAFE. -f is plain --force in disguise — unconditional overwrite. Use the lease.' },
        ],
        hint: 'Force, but with a lease.',
        success: 'Rewritten history published. The lease held — no agents were harmed.',
      },
      {
        objective: 'Stamp the milestone',
        scenario: `The final intelligence package is complete. Mark this commit permanently as v1.0.`,
        expected: 'git tag v1.0',
        accept: ['git tag v1.0'],
        hint: 'A permanent label on this exact commit.',
        success: 'Milestone stamped: v1.0 — Operation Shadow Breach, final package.',
      },
      {
        objective: 'Seal the vault',
        scenario: `Last step of the entire operation: export the repository's current state — files only, no Git history — as shadow-breach-final.zip for the classified evidence vault.`,
        expected: 'git archive --format=zip HEAD -o shadow-breach-final.zip',
        accept: ['git archive --format=zip HEAD -o shadow-breach-final.zip'],
        hint: 'archive, zip format, HEAD, -o and the filename.',
        success: 'Evidence sealed. Stand by for the Director...',
      },
    ],
  },
}
