import { useContext } from 'react'
import { ProgressContext } from './context'

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside a ProgressProvider')
  return ctx
}
