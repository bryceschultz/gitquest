export const m2l4 = {
  id: 'M2L4',
  cmd: 'git restore',
  diff: 'med',
  title: 'git restore',
  subtitle: 'Discard uncommitted changes to a file',
  briefing: `An analyst on your team accidentally overwrote suspect-file.txt with incorrect data. The file hasn't been committed yet — restore it to its last known good state before the error becomes permanent.`,
  sections: [
    {
      heading: 'What it does',
      body: `git restore discards changes in the working directory and reverts the file back to its last committed state. Think of it as pulling a clean copy of the file from the agency's secure backup.`,
    },
    {
      heading: 'Basic syntax',
      blocks: [
        { code: 'git restore <filename>', desc: 'Discard uncommitted changes to a file' },
        { code: 'git restore --staged <filename>', desc: 'Unstage a file without discarding its changes' },
      ],
    },
    {
      heading: 'Example',
      terminal: [
        { prompt: '$', cmd: 'git status' },
        { output: 'modified: suspect-file.txt' },
        { prompt: '$', cmd: 'git restore suspect-file.txt' },
        { prompt: '$', cmd: 'git status', comment: '# confirm it\'s clean' },
        { output: 'nothing to commit, working tree clean' },
      ],
    },
    {
      heading: 'Watch out for',
      warnings: [
        'git restore permanently discards uncommitted changes — there\'s no undo once it runs.',
        'If the file was already staged, you may need git restore --staged first before restoring the working copy.',
      ],
    },
  ],
  battle: {
    scenario: `suspect-file.txt has been modified incorrectly and is not yet staged. What command reverts it to the version from your last commit?`,
    expected: 'git restore suspect-file.txt',
    accept: ['git checkout -- suspect-file.txt'],
    hint: 'Restore a single specific file to its last committed state.',
  },
}