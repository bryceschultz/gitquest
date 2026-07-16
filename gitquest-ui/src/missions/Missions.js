import { mission1 } from './mission1/Mission1'
import { mission2 } from './mission2/Mission2'
import { mission3 } from './mission3/Mission3'
import { mission4 } from './mission4/Mission4'

// Workflow-first curriculum: 4 Missions, each a real Git workflow theme.
// Mission > Assignment (thematic cluster of commands that travel together)
// > Level (one lesson), ending in a Field Assignment (sequential multi-step
// battle composing the mission's commands). Unlocking, progress, and
// next-lesson logic all derive from this order.
export const MISSION_ORDER = ['M1', 'M2', 'M3', 'M4']

export const MISSIONS = {
  M1: mission1,
  M2: mission2,
  M3: mission3,
  M4: mission4,
}
