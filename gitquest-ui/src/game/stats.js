// Every number shown in the UI (progress bars, coins, trophy stats) is
// derived here from ProgressContext state + the mission registry.
// No component may display a hard-coded game value.

import { MISSIONS, MISSION_ORDER } from '../missions/Missions'

export const COINS_PER_LEVEL = 10
export const COINS_PER_MISSION_BONUS = 25

export function totalLevels(missions = MISSIONS, order = MISSION_ORDER) {
  return order.reduce((n, id) => n + Object.keys(missions[id]?.levels ?? {}).length, 0)
}

// Count only completions that correspond to real, registered lessons —
// imported/stale progress can contain ids that no longer exist.
function validCompleted(progress, missions, order) {
  const known = new Set()
  for (const id of order) {
    for (const levelId of Object.keys(missions[id]?.levels ?? {})) known.add(levelId)
  }
  return (progress?.completedLevels ?? []).filter(id => known.has(id))
}

export function completedCount(progress, missions = MISSIONS, order = MISSION_ORDER) {
  return validCompleted(progress, missions, order).length
}

export function overallPct(progress, missions = MISSIONS, order = MISSION_ORDER) {
  const total = totalLevels(missions, order)
  if (total === 0) return 0
  return Math.round((completedCount(progress, missions, order) / total) * 100)
}

export function missionProgress(missionId, progress, missions = MISSIONS) {
  const levels = Object.keys(missions[missionId]?.levels ?? {})
  const completedSet = new Set(progress?.completedLevels ?? [])
  const completed = levels.filter(id => completedSet.has(id)).length
  const total = levels.length
  return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

export function isMissionComplete(missionId, progress, missions = MISSIONS) {
  const { completed, total } = missionProgress(missionId, progress, missions)
  return total > 0 && completed === total
}

export function missionsCompleted(progress, missions = MISSIONS, order = MISSION_ORDER) {
  return order.filter(id => isMissionComplete(id, progress, missions)).length
}

export function earnedCoins(progress, missions = MISSIONS, order = MISSION_ORDER) {
  return (
    completedCount(progress, missions, order) * COINS_PER_LEVEL +
    missionsCompleted(progress, missions, order) * COINS_PER_MISSION_BONUS
  )
}

// Spendable balance. Invariant: never negative, even if stored data is odd.
export function coinBalance(progress, missions = MISSIONS, order = MISSION_ORDER) {
  const spent = Number(progress?.spentCoins) || 0
  return Math.max(0, earnedCoins(progress, missions, order) - spent)
}

export function perfectScores(progress) {
  return Object.values(progress?.scores ?? {}).filter(s => s === 100).length
}

export function averageScore(progress) {
  const scores = Object.values(progress?.scores ?? {})
  if (scores.length === 0) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// Assessment score for one battle (FR-06): starts at 100, −25 per wrong
// attempt, −10 if the hint was revealed, floor of 25.
export function battleScore(wrongAttempts, hintUsed) {
  return Math.max(25, 100 - 25 * wrongAttempts - (hintUsed ? 10 : 0))
}
