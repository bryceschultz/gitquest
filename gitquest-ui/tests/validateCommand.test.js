import { validateCommand, normalizeCommand, tokenize, STATUS } from '../src/game/validateCommand'

const clone = {
  expected: 'git clone https://github.com/us-cyber/shadow-breach.git',
}

const commit = {
  expected: 'git commit -m "Discovered Shadow Breach command server"',
  accept: ["git commit -m 'Discovered Shadow Breach command server'"],
}

const forceWithLease = {
  expected: 'git push --force-with-lease',
  reject: [
    { cmd: 'git push --force', message: 'UNSAFE: --force can destroy teammates\u2019 work.' },
    { cmd: 'git push -f', message: 'UNSAFE: -f can destroy teammates\u2019 work.' },
  ],
}

describe('tokenize / normalizeCommand', () => {
  test('collapses internal whitespace', () => {
    expect(normalizeCommand('  git    pull \t ')).toBe('git pull')
  })

  test('preserves spaces inside quotes and straightens smart quotes', () => {
    expect(normalizeCommand('git commit -m \u201Chello   world\u201D')).toBe('git commit -m "hello   world"')
  })

  test('handles unterminated quote without throwing', () => {
    expect(() => tokenize('git commit -m "oops')).not.toThrow()
    expect(tokenize('git commit -m "oops')[3]).toEqual({ value: 'oops', quoted: true })
  })
})

describe('validateCommand — acceptance', () => {
  test('accepts the exact expected command', () => {
    const r = validateCommand('git clone https://github.com/us-cyber/shadow-breach.git', clone)
    expect(r.status).toBe(STATUS.CORRECT)
    expect(r.correct).toBe(true)
  })

  test('accepts with irregular whitespace', () => {
    const r = validateCommand('   git   clone    https://github.com/us-cyber/shadow-breach.git  ', clone)
    expect(r.correct).toBe(true)
  })

  test('accepts documented variants (single-quoted commit message)', () => {
    const r = validateCommand("git commit -m 'Discovered Shadow Breach command server'", commit)
    expect(r.correct).toBe(true)
  })

  test('accepts smart quotes typed by mobile keyboards', () => {
    const r = validateCommand('git commit -m \u201CDiscovered Shadow Breach command server\u201D', commit)
    expect(r.correct).toBe(true)
  })

  test('<message> placeholder accepts any non-empty quoted message', () => {
    const step = { expected: 'git commit -m "Patch firewall breach"', accept: ['git commit -m <message>'] }
    expect(validateCommand('git commit -m "my own words"', step).correct).toBe(true)
    expect(validateCommand('git commit -m ""', step).correct).toBe(false)
    expect(validateCommand('git commit -m unquoted', step).correct).toBe(false)
  })
})

describe('validateCommand — diagnostics', () => {
  test('empty and whitespace-only input get a specific message', () => {
    for (const raw of ['', '    ', '\t']) {
      const r = validateCommand(raw, clone)
      expect(r.status).toBe(STATUS.EMPTY)
      expect(r.message).toMatch(/didn\u2019t enter/)
    }
  })

  test('non-git input is identified', () => {
    const r = validateCommand('svn checkout repo', clone)
    expect(r.status).toBe(STATUS.NOT_GIT)
  })

  test('uppercase GIT is flagged as a case mistake', () => {
    expect(validateCommand('Git clone https://github.com/us-cyber/shadow-breach.git', clone).status).toBe(STATUS.CASE)
  })

  test('bare git is a missing-argument error', () => {
    expect(validateCommand('git', clone).status).toBe(STATUS.MISSING_ARGUMENT)
  })

  test('wrong subcommand is identified', () => {
    const r = validateCommand('git pull', clone)
    expect(r.status).toBe(STATUS.WRONG_COMMAND)
  })

  test('missing argument names what kind is missing', () => {
    const r = validateCommand('git clone', clone)
    expect(r.status).toBe(STATUS.MISSING_ARGUMENT)
    expect(r.message).toMatch(/argument/)
  })

  test('extra arguments are identified', () => {
    const r = validateCommand('git pull origin main extra', { expected: 'git pull' })
    expect(r.status).toBe(STATUS.EXTRA_ARGUMENT)
  })

  test('wrong filename is a targeted wrong-argument error', () => {
    const r = validateCommand('git add wrong-file.txt', { expected: 'git add attack-report.txt' })
    expect(r.status).toBe(STATUS.WRONG_ARGUMENT)
    expect(r.message).toMatch(/filename/)
  })

  test('misspelled long flag gets a spelling nudge', () => {
    const r = validateCommand('git push --force-with-least', forceWithLease)
    expect(r.status).toBe(STATUS.WRONG_ARGUMENT)
    expect(r.message).toMatch(/spelling/)
  })

  test('wrong commit message is described as a message mismatch', () => {
    const r = validateCommand('git commit -m "wrong message"', commit)
    expect(r.status).toBe(STATUS.WRONG_ARGUMENT)
    expect(r.message).toMatch(/message/)
  })

  test('case-mismatched branch name is flagged as case-sensitivity', () => {
    const r = validateCommand('git branch Decoy-Operation', { expected: 'git branch decoy-operation' })
    expect(r.status).toBe(STATUS.CASE)
  })
})

describe('validateCommand — reject rules (unsafe variants)', () => {
  test('git push --force is rejected with the unsafe message', () => {
    const r = validateCommand('git push --force', forceWithLease)
    expect(r.status).toBe(STATUS.REJECTED)
    expect(r.message).toMatch(/UNSAFE/)
  })

  test('git push -f is rejected with the unsafe message', () => {
    const r = validateCommand('git push   -f', forceWithLease)
    expect(r.status).toBe(STATUS.REJECTED)
  })

  test('validator never throws for arbitrary input', () => {
    const nasty = ['"""', "'''", 'git "', '💥 git', 'git\u0000push', null, undefined, 12345]
    for (const raw of nasty) {
      expect(() => validateCommand(raw, forceWithLease)).not.toThrow()
      expect(validateCommand(raw, forceWithLease).correct).toBe(false)
    }
  })
})
