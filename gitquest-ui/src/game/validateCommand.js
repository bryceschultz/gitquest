// Structured command validation for battle scenarios (FR-05).
//
// Replaces the original exact-string comparison with a small, deterministic
// validator that:
//   * normalizes whitespace and smart quotes,
//   * accepts documented per-lesson variants (`battle.accept`),
//   * rejects known dangerous/typo variants with targeted messages (`battle.reject`),
//   * otherwise diagnoses WHAT is wrong: empty input, not a git command,
//     wrong subcommand, missing/extra/incorrect arguments, wrong flag,
//     wrong commit message, or a case-sensitivity mistake.
//
// This is intentionally NOT a Git parser or repository simulator: the MVP is a
// simulation driven by controlled lesson data (SFS constraint). Every rule is
// data-driven from the lesson's battle definition.
//
// Invariants:
//   * validateCommand never throws for any string input.
//   * status === 'correct' if and only if the normalized input equals the
//     expected command or one of its accepted variants (with `<message>` /
//     `<any>` placeholders honoured).

export const STATUS = {
  CORRECT: 'correct',
  EMPTY: 'empty',
  NOT_GIT: 'not_git',
  CASE: 'case',
  WRONG_COMMAND: 'wrong_command',
  MISSING_ARGUMENT: 'missing_argument',
  EXTRA_ARGUMENT: 'extra_argument',
  WRONG_ARGUMENT: 'wrong_argument',
  REJECTED: 'rejected',
}

// Replace “smart” quotes (typed by some mobile keyboards / word processors)
// with straight quotes so learners aren't failed for invisible differences.
function straightenQuotes(text) {
  return text
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
}

// Tokenize a command respecting single/double quotes.
// Returns [{ value, quoted }]. An unterminated quote consumes the rest of the
// string as one quoted token (no throw).
export function tokenize(raw) {
  const text = straightenQuotes(String(raw ?? '')).trim()
  const tokens = []
  let i = 0
  while (i < text.length) {
    // skip whitespace between tokens
    if (/\s/.test(text[i])) { i += 1; continue }
    if (text[i] === '"' || text[i] === "'") {
      const quote = text[i]
      let j = i + 1
      while (j < text.length && text[j] !== quote) j += 1
      tokens.push({ value: text.slice(i + 1, j), quoted: true })
      i = j + 1 // skip closing quote (or run off the end safely)
    } else {
      let j = i
      while (j < text.length && !/\s/.test(text[j])) j += 1
      tokens.push({ value: text.slice(i, j), quoted: false })
      i = j
    }
  }
  return tokens
}

// Canonical string form: single spaces, straight double quotes around
// quoted tokens. Used for equality checks against expected/accept/reject.
export function normalizeCommand(raw) {
  return tokenize(raw)
    .map(t => (t.quoted ? `"${t.value}"` : t.value))
    .join(' ')
}

// Does a tokenized input match a tokenized pattern?
// Pattern placeholders:
//   <message> — any NON-EMPTY QUOTED token (e.g. a commit message)
//   <any>     — any non-empty token
function tokensMatch(inputTokens, patternTokens) {
  if (inputTokens.length !== patternTokens.length) return false
  for (let i = 0; i < patternTokens.length; i += 1) {
    const p = patternTokens[i]
    const t = inputTokens[i]
    if (p.value === '<message>' && !p.quoted) {
      if (!t.quoted || t.value.trim() === '') return false
    } else if (p.value === '<any>' && !p.quoted) {
      if (t.value.trim() === '') return false
    } else if (p.value !== t.value || p.quoted !== t.quoted) {
      return false
    }
  }
  return true
}

function looksLikeFlag(value) {
  return value.startsWith('-')
}

function sharedPrefixLength(a, b) {
  let n = 0
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1
  return n
}

// Main entry point.
// `battle` is a lesson battle (or capstone step) object:
//   { expected, accept?: string[], reject?: [{ cmd, message }], ... }
export function validateCommand(rawInput, battle) {
  const inputTokens = tokenize(rawInput)
  const normalized = normalizeCommand(rawInput)

  if (inputTokens.length === 0) {
    return {
      status: STATUS.EMPTY,
      correct: false,
      message: 'You didn\u2019t enter a command. Type a Git command in the field \u2014 it will start with "git".',
    }
  }

  // 1) Known-bad variants get their targeted, teaching message first.
  for (const rule of battle.reject ?? []) {
    if (normalizeCommand(rule.cmd) === normalized) {
      return { status: STATUS.REJECTED, correct: false, message: rule.message }
    }
  }

  // 2) Accepted forms: the canonical expected answer plus documented variants.
  const acceptedPatterns = [battle.expected, ...(battle.accept ?? [])]
  for (const pattern of acceptedPatterns) {
    if (tokensMatch(inputTokens, tokenize(pattern))) {
      return { status: STATUS.CORRECT, correct: true, message: 'Command accepted.' }
    }
  }

  // 3) Diagnose what went wrong, comparing against the canonical expected form.
  const expectedTokens = tokenize(battle.expected)
  const [first] = inputTokens

  if (first.value !== 'git') {
    if (first.value.toLowerCase() === 'git') {
      return {
        status: STATUS.CASE,
        correct: false,
        message: 'Git commands are lowercase \u2014 start with "git", not "' + first.value + '".',
      }
    }
    return {
      status: STATUS.NOT_GIT,
      correct: false,
      message: 'Every Git command starts with "git". Try the form: git <subcommand> [arguments].',
    }
  }

  const expectedSub = expectedTokens[1]?.value
  const inputSub = inputTokens[1]?.value

  if (inputSub === undefined) {
    return {
      status: STATUS.MISSING_ARGUMENT,
      correct: false,
      message: '"git" by itself doesn\u2019t do anything \u2014 it needs a subcommand. Check the Basic syntax section above.',
    }
  }

  if (inputSub !== expectedSub) {
    if (inputSub.toLowerCase() === expectedSub) {
      return {
        status: STATUS.CASE,
        correct: false,
        message: 'Git is case-sensitive \u2014 subcommands are lowercase. Check the capitalization of "' + inputSub + '".',
      }
    }
    return {
      status: STATUS.WRONG_COMMAND,
      correct: false,
      message: '"git ' + inputSub + '" won\u2019t accomplish this objective \u2014 the scenario calls for a different Git command. Re-read the briefing and the tutorial above.',
    }
  }

  // Same subcommand — compare argument lists (everything after `git <sub>`).
  const expectedArgs = expectedTokens.slice(2)
  const inputArgs = inputTokens.slice(2)

  if (inputArgs.length < expectedArgs.length) {
    const missing = expectedArgs[inputArgs.length]
    const kind = looksLikeFlag(missing.value)
      ? 'a flag that changes how it behaves'
      : missing.quoted
        ? 'a quoted message'
        : 'an argument (a name, file, or target)'
    return {
      status: STATUS.MISSING_ARGUMENT,
      correct: false,
      message: 'Right command, but "git ' + expectedSub + '" needs more here \u2014 you\u2019re missing ' + kind + '. Check the Basic syntax section above.',
    }
  }

  if (inputArgs.length > expectedArgs.length) {
    return {
      status: STATUS.EXTRA_ARGUMENT,
      correct: false,
      message: 'That\u2019s more arguments than this scenario needs \u2014 keep it to exactly what the objective asks for.',
    }
  }

  // Equal length: find the first mismatching argument and describe it.
  for (let i = 0; i < expectedArgs.length; i += 1) {
    const exp = expectedArgs[i]
    const got = inputArgs[i]
    if (exp.value === got.value && exp.quoted === got.quoted) continue

    if (exp.value.toLowerCase() === got.value.toLowerCase() && exp.quoted === got.quoted) {
      return {
        status: STATUS.CASE,
        correct: false,
        message: 'So close \u2014 Git is case-sensitive. Check the capitalization of "' + got.value + '".',
      }
    }
    if (exp.quoted || got.quoted) {
      return {
        status: STATUS.WRONG_ARGUMENT,
        correct: false,
        message: 'Right structure, but the quoted message doesn\u2019t match the one HQ specified. Copy it exactly, including punctuation.',
      }
    }
    if (looksLikeFlag(exp.value) && looksLikeFlag(got.value)) {
      const close = sharedPrefixLength(exp.value, got.value) >= 3
      return {
        status: STATUS.WRONG_ARGUMENT,
        correct: false,
        message: close
          ? 'Almost \u2014 check the exact spelling of that flag. Every character matters.'
          : '"' + got.value + '" isn\u2019t the right option here. Check the flags shown in the tutorial above.',
      }
    }
    const looksLikeUrl = exp.value.startsWith('http')
    const looksLikeFile = exp.value.includes('.') && !looksLikeUrl
    const target = looksLikeUrl ? 'URL' : looksLikeFile ? 'filename' : 'target name'
    return {
      status: STATUS.WRONG_ARGUMENT,
      correct: false,
      message: 'Right command, wrong target \u2014 double-check the exact ' + target + ' given in the scenario.',
    }
  }

  // Token values matched but quoting differed everywhere else — treat as wrong argument.
  return {
    status: STATUS.WRONG_ARGUMENT,
    correct: false,
    message: 'Not quite \u2014 compare your command carefully against the syntax shown in the tutorial above.',
  }
}
