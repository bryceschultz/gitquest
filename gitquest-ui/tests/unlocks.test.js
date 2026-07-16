import {
  orderedLevels,
  isLevelUnlocked,
  isMissionUnlocked,
  nextPlayableLevel,
  nextLevelAfter,
} from '../src/game/unlocks'

// A small fake registry so the rules are tested independently of real content.
const missions = {
  A: { id: 'A', levels: { A1: { id: 'A1' }, A2: { id: 'A2' } } },
  B: { id: 'B', levels: { B1: { id: 'B1' } } },
  C: { id: 'C', levels: { C1: { id: 'C1' }, C2: { id: 'C2' } } },
}
const order = ['A', 'B', 'C']

const recruit = (completed = []) => ({ mode: 'new', completedLevels: completed })
const vet = (completed = []) => ({ mode: 'vet', completedLevels: completed })

describe('orderedLevels', () => {
  test('flattens missions in canonical order', () => {
    expect(orderedLevels(missions, order).map(e => e.levelId)).toEqual(['A1', 'A2', 'B1', 'C1', 'C2'])
  })
})

describe('New recruit — sequential unlocking', () => {
  test('only the very first lesson is unlocked at 0% progress', () => {
    const p = recruit()
    expect(isLevelUnlocked('A1', p, missions, order)).toBe(true)
    expect(isLevelUnlocked('A2', p, missions, order)).toBe(false)
    expect(isLevelUnlocked('B1', p, missions, order)).toBe(false)
  })

  test('completing a lesson unlocks exactly the next one', () => {
    const p = recruit(['A1'])
    expect(isLevelUnlocked('A2', p, missions, order)).toBe(true)
    expect(isLevelUnlocked('B1', p, missions, order)).toBe(false)
  })

  test('unlocking crosses mission boundaries', () => {
    const p = recruit(['A1', 'A2'])
    expect(isLevelUnlocked('B1', p, missions, order)).toBe(true)
    expect(isMissionUnlocked('B', p, missions, order)).toBe(true)
    expect(isMissionUnlocked('C', p, missions, order)).toBe(false)
  })

  test('completed lessons stay replayable even when later ones are locked', () => {
    const p = recruit(['A1'])
    expect(isLevelUnlocked('A1', p, missions, order)).toBe(true)
  })

  test('missing mode is treated as recruit (safe default)', () => {
    const p = { completedLevels: [] }
    expect(isLevelUnlocked('B1', p, missions, order)).toBe(false)
  })

  test('unknown level id is locked', () => {
    expect(isLevelUnlocked('ZZ9', recruit(['A1', 'A2', 'B1', 'C1', 'C2']), missions, order)).toBe(false)
  })
})

describe('Field agent — free navigation', () => {
  test('everything is unlocked with zero progress', () => {
    const p = vet()
    for (const { levelId } of orderedLevels(missions, order)) {
      expect(isLevelUnlocked(levelId, p, missions, order)).toBe(true)
    }
    expect(isMissionUnlocked('C', p, missions, order)).toBe(true)
  })
})

describe('nextPlayableLevel', () => {
  test('returns the first incomplete lesson of the mission', () => {
    expect(nextPlayableLevel('A', recruit(['A1']), missions, order)).toBe('A2')
  })

  test('returns the first lesson for replay when the mission is complete', () => {
    expect(nextPlayableLevel('A', recruit(['A1', 'A2']), missions, order)).toBe('A1')
  })

  test('returns null when the next incomplete lesson is still locked (recruit)', () => {
    expect(nextPlayableLevel('C', recruit(['A1']), missions, order)).toBeNull()
  })

  test('field agents can always start any mission', () => {
    expect(nextPlayableLevel('C', vet(), missions, order)).toBe('C1')
  })
})

describe('nextLevelAfter', () => {
  test('advances within and across missions, and ends at null', () => {
    expect(nextLevelAfter('A1', missions, order)).toEqual({ missionId: 'A', levelId: 'A2' })
    expect(nextLevelAfter('A2', missions, order)).toEqual({ missionId: 'B', levelId: 'B1' })
    expect(nextLevelAfter('C2', missions, order)).toBeNull()
    expect(nextLevelAfter('nope', missions, order)).toBeNull()
  })
})
