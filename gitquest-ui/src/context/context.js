import { createContext } from 'react'

export const ProgressContext = createContext(null)
export const STORAGE_KEY = 'gitquest-progress'

export const defaultProgress = {
  completedLevels: [],   // e.g. ['M1L1', 'M1L2']
  currentMission: 'M1',
  currentLevel: 'M1L1',
  mode: null,            // 'new' (recruit, sequential) | 'vet' (field agent, free roam)
  scores: {},            // levelId -> best assessment score (0–100)
  hintsUsed: 0,          // lifetime hint reveals
  achievements: {},      // achievementId -> ISO date earned
  placement: null,       // { correct, total, pct, passed, recommendedMission, date }
  inventory: [],         // arsenal item ids owned
  spentCoins: 0,         // total coins spent in the arsenal
}
