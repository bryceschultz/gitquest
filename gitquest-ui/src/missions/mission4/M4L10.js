export const m4l10 = {
  id: 'M4L10',
  cmd: 'git commit -S',
  diff: 'hard',
  title: 'git commit -S',
  subtitle: 'Sign and seal the intelligence',
  briefing: `The final phase of the operation requires all submitted intelligence to be cryptographically verified. Sign your commit to prove its authenticity before transmitting to HQ.`,
  sections: [
    {
      heading: 'What it does',
      body: `The agency now requires all final intelligence submissions to be cryptographically signed to prove authenticity. git commit -S creates a GPG-signed commit, allowing anyone to verify that the commit genuinely came from you and hasn't been tampered with. Think of it as signing and sealing an intelligence report with your official agency credentials so its authenticity can never be disputed.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git commit -S -m "message"', desc: 'Create a GPG-signed commit' },
        { code: 'git log --show-signature', desc: 'Verify signatures in the history' },
        { code: 'git config commit.gpgsign true', desc: 'Sign every commit automatically from now on' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git commit -S -m "Verified: Shadow Breach server locations confirmed"' },
        { output: '[main a9d31c7] Verified: Shadow Breach server locations confirmed\n 1 file changed, 8 insertions(+)' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Signing requires a GPG (or SSH) key configured in Git first — the -S flag alone can\u2019t conjure credentials.',
        'Capital -S signs the commit; lowercase -s adds a plain-text Signed-off-by line. They are NOT the same.',
      ],
    },
  ],
  battle: {
    scenario: `You need to create a signed commit with a message confirming your findings. What command creates a GPG-signed commit?`,
    expected: 'git commit -S -m "Verified: Shadow Breach server locations confirmed"',
    accept: ['git commit -S -m <message>'],
    reject: [
      { cmd: 'git commit -s -m <message>', message: 'Lowercase -s only appends a Signed-off-by text line — no cryptography involved. The agency requires the CAPITAL flag that GPG-signs the commit.' },
    ],
    hint: 'A normal commit with a message, plus the capital flag that means "Sign."',
  },
}
