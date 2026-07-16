export const m1l1 = {
  id: 'M1L1',
  cmd: 'git clone',
  diff: 'easy',
  title: 'git clone',
  subtitle: 'Download a complete copy of a remote repository',
  briefing: `Agent HQ has located the Shadow Breach intelligence database. The repository contains clues about the hackers' next target, but it lives on a remote server — you need it on your own machine before you can start digging.`,
  sections: [
    {
      heading: 'What it does',
      body: `git clone creates a complete copy of a remote repository on your local machine, including all files and the entire commit history. Think of it like downloading the agency's entire case file so you can work on it locally.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git clone <repository-url>', desc: 'Clone a repository into a new directory' },
        { code: 'git clone <repository-url> <folder-name>', desc: 'Clone into a custom-named folder' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git clone https://github.com/us-cyber/shadow-breach.git' },
        { output: 'Cloning into \'shadow-breach\'...\nremote: Enumerating objects: 128, done.\nReceiving objects: 100% (128/128), done.' },
        { prompt: '$', cmd: 'cd shadow-breach', comment: '# enter the new local copy' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'Cloning downloads the full commit history, not just the latest files — large repos can take a while.',
        'Make sure you have the correct URL; a typo will fail or clone the wrong intel.',
      ],
    },
  ],
  battle: {
    scenario: `HQ sends you a repository URL containing classified intelligence: https://github.com/us-cyber/shadow-breach.git. What command should you use to download the repository?`,
    expected: 'git clone https://github.com/us-cyber/shadow-breach.git',
    hint: 'Use git clone followed by the repository URL.',
  },
}