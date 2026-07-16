export const m4l4 = {
  id: 'M4L4',
  cmd: 'git push --force-with-lease',
  diff: 'hard',
  title: 'git push --force-with-lease',
  subtitle: 'Overwrite remote history — but only if no one else has pushed',
  briefing: `You amended a commit to scrub a leaked credential from the intel report, so your local history no longer matches the remote. A normal push is rejected. You must overwrite the remote branch — without destroying work another agent may have pushed in the meantime.`,
  sections: [
    {
      heading: 'What it does',
      body: `When local history has been rewritten (amend, rebase), the remote rejects a normal push. --force-with-lease overwrites the remote branch ONLY if it still looks the way you last saw it. If a teammate pushed something new since your last fetch, the push is refused instead of silently deleting their work. That safety check is what plain --force does not have.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git push --force-with-lease', desc: 'Force-push with a safety check against teammates\u2019 new commits' },
        { code: 'git push --force', desc: 'DANGEROUS: overwrites the remote unconditionally — can permanently destroy others\u2019 pushed work' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git push' },
        { output: ' ! [rejected]        main -> main (non-fast-forward)\nerror: failed to push some refs' },
        { prompt: '$', cmd: 'git push --force-with-lease' },
        { output: 'To https://github.com/us-cyber/shadow-breach.git\n + 7e83b04...d41c0ff main -> main (forced update)' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Never use plain --force (or -f) on a shared branch — it overwrites the remote unconditionally and can erase teammates\u2019 commits.',
        'The "lease" is based on what you last fetched. Fetch recently before relying on it.',
        'Every character of the flag matters: --force-with-lease.',
      ],
    },
  ],
  battle: {
    scenario: `Your normal push was rejected because you rewrote local history to remove the leaked credential. Overwrite the remote branch the SAFE way — the way that refuses to run if another agent has pushed since your last fetch.`,
    expected: 'git push --force-with-lease',
    reject: [
      { cmd: 'git push --force', message: 'UNSAFE — plain --force overwrites the remote unconditionally and can permanently destroy another agent\u2019s pushed work. There\u2019s a safer flag that checks first.' },
      { cmd: 'git push -f', message: 'UNSAFE — -f is shorthand for --force: it overwrites the remote unconditionally. Use the flag that verifies no one else has pushed.' },
    ],
    hint: 'It\u2019s a push with one long flag: force, with a lease.',
  },
}
