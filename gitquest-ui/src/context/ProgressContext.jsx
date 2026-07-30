import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ProgressContext = createContext(null);
//const BASE_URL = import.meta.env.local.VITE_API_URL //
const BASE_URL = 'http://localhost:5001/api';

/**
 *
 * @param param0
 * @param param0.children
 * @returns {React.JSX.Element}
 * @constructor
 */
export function ProgressProvider({ children }) {
  const [completedIds, setCompletedIds] = useState(new Set())
  const [coins, setCoins]               = useState(0)
  const [totalXP, setTotalXP]           = useState(0)
  const [loaded, setLoaded]             = useState(false)

  // ── Load progress from DB on mount ───────────────────────
  async function loadProgress() {
    try {
      const res  = await fetch(`${BASE_URL}/missions/progress`, { credentials: 'include' })
      if (!res.ok) return
      const { completedIds: ids } = await res.json()
      setCompletedIds(new Set(ids))
    } catch (err) {
      console.error('Failed to load progress:', err)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => { loadProgress() }, [])

  // ── Mark a mission complete locally + persist to DB ───────
  const completeLevel = useCallback(async (missionId) => {
    if (!missionId) return
    setCompletedIds(prev => new Set([...prev, String(missionId)]))
    try {
      await fetch(`${BASE_URL}/missions/progress`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ missionId }),
      })
    } catch (err) {
      console.error('Failed to save progress:', err)
    }
  }, [])

  const isLevelComplete = useCallback((missionId) => {
    return completedIds.has(String(missionId))
  }, [completedIds])

  // Replace addCoins with a DB-backed version
  const addCoins = useCallback((amount) => {
    setCoins(prev => Math.max(0, prev + amount))
  }, [])

  // Load initial coin balance from agent data
  const loadCoins = useCallback((amount) => {
    setCoins(amount ?? 0)
  }, [])

  // Add XP
  const addXP = useCallback((amount) => {
    setTotalXP(prev => prev + amount)
  }, [])

  // Load XP from agent data
  const loadXP = useCallback((amount) => {
    setTotalXP(amount ?? 0)
  }, [])

  // ── Reload progress (call after sign-in) ─────────────────
  const reloadProgress = useCallback(async () => {
    setLoaded(false)
    setCompletedIds(new Set())
    await loadProgress()
  }, [])

  // ── Reset on logout ───────────────────────────────────────
  const resetProgress = useCallback(() => {
    setCompletedIds(new Set())
    setCoins(0)
    setLoaded(false)
  }, [])

  const value = {
    completedIds,
    coins,
    loaded,
    completeLevel,
    isLevelComplete,
    addCoins,
    loadCoins,
    totalXP,
    loadXP,
    addXP,
    reloadProgress,
    resetProgress,
    progress: { coins, totalXP },
  }

  return (
      <ProgressContext.Provider value={value}>
        {children}
      </ProgressContext.Provider>
  )
}

/**
 *
 * @returns {*}
 */
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside a ProgressProvider');
  return ctx;
}