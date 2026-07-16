import {
  totalLevels, completedCount, overallPct, missionProgress,
  missionsCompleted, earnedCoins, coinBalance, battleScore,
  perfectScores, averageScore,
} from '../src/game/stats'
import { ACHIEVEMENTS, updatedAchievements } from '../src/game/achievements'
import { MISSIONS, MISSION_ORDER } from '../src/missions/Missions'
import { defaultProgress } from '../src/context/context'

const allLevelIds = MISSION_ORDER.flatMap(id => Object.keys(MISSIONS[id].levels))
const mission1Ids = Object.keys(MISSIONS.M1.levels)

const withProgress = (extra) => ({ ...defaultProgress, ...extra })

describe('stats — derived progress', () => {
  test('the registry contains the full workflow curriculum (4 missions, 32 lessons + 4 field assignments)', () => {
    expect(totalLevels()).toBe(36)
    expect(mission1Ids).toHaveLength(7) // 6 lessons + field assignment
  })

  test('0% / partial / 100% overall progress', () => {
    expect(overallPct(withProgress())).toBe(0)
    expect(overallPct(withProgress({ completedLevels: ['M1L1'] }))).toBe(Math.round(100 / 36))
    expect(overallPct(withProgress({ completedLevels: allLevelIds }))).toBe(100)
  })

  test('stale/unknown completions are ignored, not counted', () => {
    const p = withProgress({ completedLevels: ['M1L1', 'DELETED-LEVEL'] })
    expect(completedCount(p)).toBe(1)
  })

  test('per-mission progress', () => {
    const p = withProgress({ completedLevels: ['M1L1', 'M1L2'] })
    expect(missionProgress('M1', p)).toEqual({ completed: 2, total: 7, pct: 29 })
    expect(missionProgress('M2', p)).toEqual({ completed: 0, total: 7, pct: 0 })
  })

  test('coins: 10 per lesson + 25 per completed mission; balance never negative', () => {
    const m1 = Object.keys(MISSIONS.M1.levels)
    const p = withProgress({ completedLevels: m1 })
    expect(missionsCompleted(p)).toBe(1)
    expect(earnedCoins(p)).toBe(7 * 10 + 25)
    expect(coinBalance(withProgress({ completedLevels: m1, spentCoins: 30 }))).toBe(65)
    expect(coinBalance(withProgress({ completedLevels: [], spentCoins: 999 }))).toBe(0)
  })

  test('battleScore: attempts and hint penalties with a floor of 25', () => {
    expect(battleScore(0, false)).toBe(100) // first try, no hint
    expect(battleScore(1, false)).toBe(75)
    expect(battleScore(1, true)).toBe(65)
    expect(battleScore(9, true)).toBe(25)  // floor
  })

  test('perfect and average scores', () => {
    const p = withProgress({ scores: { M1L1: 100, M1L2: 50 } })
    expect(perfectScores(p)).toBe(1)
    expect(averageScore(p)).toBe(75)
    expect(averageScore(withProgress())).toBeNull()
  })
})

describe('achievements — earn rules', () => {
  test('nothing is earned at zero progress', () => {
    expect(updatedAchievements(withProgress())).toEqual({})
  })

  test('First Blood after one completion', () => {
    const a = updatedAchievements(withProgress({ completedLevels: ['M1L1'] }))
    expect(a['first-blood']).toBeDefined()
    expect(a['field-ready']).toBeUndefined()
  })

  test('the Mission 1 badge requires all seven M1 units, field assignment included', () => {
    const allButFA = mission1Ids.filter(id => id !== 'M1FA')
    expect(updatedAchievements(withProgress({ completedLevels: allButFA }))['field-ready']).toBeUndefined()
    const a = updatedAchievements(withProgress({ completedLevels: mission1Ids }))
    expect(a['field-ready']).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('Clean Commit requires a perfect score', () => {
    expect(updatedAchievements(withProgress({ completedLevels: ['M1L1'], scores: { M1L1: 75 } }))['clean-commit']).toBeUndefined()
    expect(updatedAchievements(withProgress({ completedLevels: ['M1L1'], scores: { M1L1: 100 } }))['clean-commit']).toBeDefined()
  })

  test('finishing everything earns the legendary badge', () => {
    const a = updatedAchievements(withProgress({ completedLevels: allLevelIds }))
    expect(a['operation-complete']).toBeDefined()
  })

  test('earned achievements are monotone — dates never change or disappear', () => {
    const existing = withProgress({ completedLevels: [], achievements: { 'first-blood': '2026-01-01' } })
    const a = updatedAchievements(existing)
    expect(a['first-blood']).toBe('2026-01-01')
  })

  test('every achievement has the fields the Trophy Room renders', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.desc).toBeTruthy()
      expect(a.icon).toBeTruthy()
      expect(['common', 'uncommon', 'rare', 'legendary']).toContain(a.rarity)
      expect(typeof a.earnedWhen).toBe('function')
    }
  })
})
