// Unlock policy (approved policy from the handoff, decision #5):
//   * New recruit ('new')  — strictly sequential: a lesson is unlocked only
//     when every lesson before it (across the canonical mission order) is
//     complete. Completed lessons always remain replayable.
//   * Field agent ('vet')  — free navigation: every mission and lesson is
//     available; a placement quiz recommends a starting point.
//   * No saved mode        — treated as New recruit (the safe default).
//
// All rules derive from ProgressContext state + MISSION_ORDER. Nothing is
// read from static flags on mission data.

import { MISSIONS, MISSION_ORDER } from '../missions/Missions'

// Flat, canonical lesson order: [{ missionId, levelId }, ...]
export function orderedLevels(missions = MISSIONS, order = MISSION_ORDER) {
  const out = []
  for (const missionId of order) {
    const mission = missions[missionId]
    if (!mission) continue
    for (const levelId of Object.keys(mission.levels)) {
      out.push({ missionId, levelId })
    }
  }
  return out
}

function isFreeRoam(progress) {
  return progress?.mode === 'vet'
}

export function isLevelUnlocked(levelId, progress, missions = MISSIONS, order = MISSION_ORDER) {
  if (isFreeRoam(progress)) return true
  const completed = new Set(progress?.completedLevels ?? [])
  if (completed.has(levelId)) return true // replay is always allowed
  for (const entry of orderedLevels(missions, order)) {
    if (entry.levelId === levelId) return true // every prior level was complete
    if (!completed.has(entry.levelId)) return false
  }
  return false // unknown level id: locked
}

export function isMissionUnlocked(missionId, progress, missions = MISSIONS, order = MISSION_ORDER) {
  const mission = missions[missionId]
  if (!mission) return false
  if (isFreeRoam(progress)) return true
  const firstLevelId = Object.keys(mission.levels)[0]
  if (firstLevelId === undefined) return false
  return isLevelUnlocked(firstLevelId, progress, missions, order)
}

// The lesson the "Start" button should open for a mission:
// the first incomplete unlocked lesson, or (fully complete) the first lesson for replay.
export function nextPlayableLevel(missionId, progress, missions = MISSIONS, order = MISSION_ORDER) {
  const mission = missions[missionId]
  if (!mission) return null
  const completed = new Set(progress?.completedLevels ?? [])
  for (const levelId of Object.keys(mission.levels)) {
    if (!completed.has(levelId)) {
      return isLevelUnlocked(levelId, progress, missions, order) ? levelId : null
    }
  }
  return Object.keys(mission.levels)[0] ?? null
}

// The lesson that follows `levelId` in the canonical order (across missions),
// or null at the end of the curriculum.
export function nextLevelAfter(levelId, missions = MISSIONS, order = MISSION_ORDER) {
  const flat = orderedLevels(missions, order)
  const i = flat.findIndex(e => e.levelId === levelId)
  if (i === -1 || i === flat.length - 1) return null
  return flat[i + 1]
}
