import React from 'react'
import { act, renderHook } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider, useProgress } from '../src/context/ProgressContext'

// Progress state has 4 independent dimensions: storage_state (empty/valid_json/
// corrupt_json), operation (the 7 functions on the context value), target_state
// (already_present/not_present) and check_point (in_memory/afterReload) —
// 84 combinations. Cases below are an all-pairs reduction.
//
// target_state is only load-bearing for completeLevel and isLevelComplete; for the
// other operations it is inert setup that must survive the call unchanged.
// afterReload unmounts the provider and mounts a fresh one, which re-reads
// localStorage — that is what proves the autosave effect actually wrote.

const STORAGE_KEY = 'gitquest-progress'
const TEST_LEVEL = 'M1L1'

const DEFAULTS = {
  completedLevels: [],
  currentMission: 'M1',
  currentLevel: 'M1L1',
}

beforeEach(() => {
  localStorage.clear()
  // jsdom implements neither of these, and exportProgress calls both.
  URL.createObjectURL = jest.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = jest.fn()
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

// Seed localStorage to match the case's storage_state before the provider mounts.
const seedStorage = (storageState, targetState) => {
  localStorage.clear()
  if (storageState === 'valid_json') {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedLevels:
          targetState === 'already_present' ? [TEST_LEVEL, 'M1L2'] : ['M1L2', 'M1L3'],
        currentMission: 'M1',
        currentLevel: 'M1L4',
      })
    )
  } else if (storageState === 'corrupt_json') {
    localStorage.setItem(STORAGE_KEY, '{ this is not valid json')
  }
}

const mount = () => renderHook(() => useProgress(), { wrapper: ProgressProvider })

// Empty and corrupt storage both hydrate to defaults, so already_present has to be
// established through the API rather than seeded into storage.
const ensureTargetState = (view, targetState) => {
  if (targetState === 'already_present' && !view.result.current.isLevelComplete(TEST_LEVEL)) {
    act(() => view.result.current.completeLevel(TEST_LEVEL))
  }
}

const setup = (storageState, targetState) => {
  seedStorage(storageState, targetState)
  const view = mount()
  ensureTargetState(view, targetState)
  return view
}

const reload = (view) => {
  view.unmount()
  return mount()
}

const importFile = (payload) =>
  new File([JSON.stringify(payload)], 'gitquest-progress.json', { type: 'application/json' })

test('case 1: empty + completeLevel + not_present + afterReload — the new level survives a remount', () => {
  const view = setup('empty', 'not_present')
  expect(view.result.current.progress.completedLevels).toEqual([])

  act(() => view.result.current.completeLevel(TEST_LEVEL))

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.completedLevels).toEqual([TEST_LEVEL])
  expect(reloaded.result.current.isLevelComplete(TEST_LEVEL)).toBe(true)
})

test('case 2: empty + isLevelComplete + already_present + in_memory — reports true for a completed level', () => {
  const view = setup('empty', 'already_present')

  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(true)
  expect(view.result.current.isLevelComplete('M1L5')).toBe(false)
})

test('case 3: empty + setCurrent + already_present + afterReload — current pointers persist without losing progress', () => {
  const view = setup('empty', 'already_present')

  act(() => view.result.current.setCurrent('M2', 'M2L3'))

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.currentMission).toBe('M2')
  expect(reloaded.result.current.progress.currentLevel).toBe('M2L3')
  expect(reloaded.result.current.progress.completedLevels).toEqual([TEST_LEVEL])
})

test('case 4: empty + setMode + not_present + in_memory — mode is added to progress', () => {
  const view = setup('empty', 'not_present')
  expect(view.result.current.progress.mode).toBeUndefined()

  act(() => view.result.current.setMode('vet'))

  expect(view.result.current.progress.mode).toBe('vet')
  expect(view.result.current.progress.completedLevels).toEqual([])
})

test('case 5: empty + resetProgress + not_present + afterReload — defaults are written back to storage', () => {
  const view = setup('empty', 'not_present')

  act(() => view.result.current.resetProgress())

  const reloaded = reload(view)
  expect(reloaded.result.current.progress).toEqual(DEFAULTS)
})

test('case 6: empty + exportProgress + already_present + in_memory — a blob url is created and released', () => {
  const view = setup('empty', 'already_present')

  act(() => view.result.current.exportProgress())

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1)
  expect(view.result.current.progress.completedLevels).toEqual([TEST_LEVEL])
})

test('case 7: empty + importProgress + not_present + afterReload — imported progress persists', async () => {
  const view = setup('empty', 'not_present')

  await act(async () => {
    await view.result.current.importProgress(importFile({ completedLevels: ['M2L1', 'M2L2'] }))
  })

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.completedLevels).toEqual(['M2L1', 'M2L2'])
})

test('case 8: valid_json + completeLevel + already_present + in_memory — completing twice does not duplicate', () => {
  const view = setup('valid_json', 'already_present')
  expect(view.result.current.progress.completedLevels).toEqual([TEST_LEVEL, 'M1L2'])

  act(() => view.result.current.completeLevel(TEST_LEVEL))

  expect(view.result.current.progress.completedLevels).toEqual([TEST_LEVEL, 'M1L2'])
})

test('case 9: valid_json + isLevelComplete + not_present + afterReload — a read leaves stored state untouched', () => {
  const view = setup('valid_json', 'not_present')

  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(false)
  expect(view.result.current.isLevelComplete('M1L2')).toBe(true)

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.completedLevels).toEqual(['M1L2', 'M1L3'])
})

test('case 10: valid_json + setCurrent + not_present + in_memory — pointers move off the stored values', () => {
  const view = setup('valid_json', 'not_present')
  expect(view.result.current.progress.currentLevel).toBe('M1L4')

  act(() => view.result.current.setCurrent('M2', 'M2L1'))

  expect(view.result.current.progress.currentMission).toBe('M2')
  expect(view.result.current.progress.currentLevel).toBe('M2L1')
})

test('case 11: valid_json + setMode + already_present + afterReload — mode persists alongside hydrated progress', () => {
  const view = setup('valid_json', 'already_present')

  act(() => view.result.current.setMode('new'))

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.mode).toBe('new')
  expect(reloaded.result.current.progress.completedLevels).toEqual([TEST_LEVEL, 'M1L2'])
})

test('case 12: valid_json + resetProgress + already_present + in_memory — hydrated progress is cleared', () => {
  const view = setup('valid_json', 'already_present')
  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(true)

  act(() => view.result.current.resetProgress())

  expect(view.result.current.progress).toEqual(DEFAULTS)
  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(false)
})

test('case 13: valid_json + exportProgress + not_present + afterReload — exporting does not mutate stored state', () => {
  const view = setup('valid_json', 'not_present')

  act(() => view.result.current.exportProgress())

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1)

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.completedLevels).toEqual(['M1L2', 'M1L3'])
  expect(reloaded.result.current.progress.currentLevel).toBe('M1L4')
})

test('case 14: valid_json + importProgress + already_present + in_memory — imported data replaces hydrated data', async () => {
  const view = setup('valid_json', 'already_present')
  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(true)

  await act(async () => {
    await view.result.current.importProgress(importFile({ completedLevels: ['M2L4'] }))
  })

  expect(view.result.current.progress.completedLevels).toEqual(['M2L4'])
  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(false)
})

test('case 15: corrupt_json + completeLevel + already_present + afterReload — recovery state is repaired and saved', () => {
  const view = setup('corrupt_json', 'already_present')

  act(() => view.result.current.completeLevel(TEST_LEVEL))

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.completedLevels).toEqual([TEST_LEVEL])
})

test('case 16: corrupt_json + isLevelComplete + not_present + in_memory — falls back to defaults instead of throwing', () => {
  const view = setup('corrupt_json', 'not_present')

  expect(view.result.current.progress).toEqual(DEFAULTS)
  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(false)
})

test('case 17: corrupt_json + setCurrent + already_present + in_memory — pointers move from the default values', () => {
  const view = setup('corrupt_json', 'already_present')
  expect(view.result.current.progress.currentMission).toBe('M1')

  act(() => view.result.current.setCurrent('M2', 'M2L5'))

  expect(view.result.current.progress.currentMission).toBe('M2')
  expect(view.result.current.progress.currentLevel).toBe('M2L5')
  expect(view.result.current.isLevelComplete(TEST_LEVEL)).toBe(true)
})

test('case 18: corrupt_json + setMode + already_present + afterReload — corrupt storage is overwritten with valid json', () => {
  const view = setup('corrupt_json', 'already_present')

  act(() => view.result.current.setMode('vet'))

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.mode).toBe('vet')
  expect(reloaded.result.current.progress.completedLevels).toEqual([TEST_LEVEL])
})

test('case 19: corrupt_json + resetProgress + not_present + in_memory — reset over a default fallback is a no-op', () => {
  const view = setup('corrupt_json', 'not_present')

  act(() => view.result.current.resetProgress())

  expect(view.result.current.progress).toEqual(DEFAULTS)
})

test('case 20: corrupt_json + exportProgress + already_present + afterReload — export works from recovered state', () => {
  const view = setup('corrupt_json', 'already_present')

  act(() => view.result.current.exportProgress())

  expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

  const reloaded = reload(view)
  expect(reloaded.result.current.progress.completedLevels).toEqual([TEST_LEVEL])
})

test('case 21: corrupt_json + importProgress + not_present + in_memory — import recovers from corrupt storage', async () => {
  const view = setup('corrupt_json', 'not_present')
  expect(view.result.current.progress.completedLevels).toEqual([])

  await act(async () => {
    await view.result.current.importProgress(importFile({ completedLevels: ['M2L2'], currentMission: 'M2' }))
  })

  expect(view.result.current.progress.completedLevels).toEqual(['M2L2'])
  expect(view.result.current.progress.currentMission).toBe('M2')
})
