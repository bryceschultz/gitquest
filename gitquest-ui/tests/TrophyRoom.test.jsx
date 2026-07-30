import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import TrophyRoom from '../src/components/TrophyRoom'

// Trophy room has 3 dimensions: earned (earned/locked), rarity (common/uncommon/
// rare/legendary) and back_action (click_back/none) — 16 combinations. Cases below
// are an all-pairs reduction.
//
// TrophyRoom renders entirely from module constants: no props beyond onBack, no
// state, no data wiring. The TROPHIES literal holds 3 earned trophies (common,
// uncommon, uncommon) and 6 locked ones, so earned+rare and earned+legendary have
// no fixture to stand on and TROPHIES is not exported for a test to patch. Cases 3
// and 4 therefore assert those pairings are absent — if a rare or legendary trophy
// is ever marked earned, they fail and need updating.

const earnedSection = () => screen.getByText(/EARNED —/).parentElement
const lockedSection = () => screen.getByText(/CLASSIFIED —/).parentElement

const renderRoom = () => {
  const onBack = jest.fn()
  render(<TrophyRoom onBack={onBack} />)
  return onBack
}

test('case 1: earned + common + no back click — the common commendation renders with its award date', () => {
  renderRoom()

  expect(screen.getByText('3 / 9 UNLOCKED')).toBeInTheDocument()
  expect(screen.getByText(/EARNED — 3/)).toBeInTheDocument()
  expect(screen.getByText('33%')).toBeInTheDocument()

  const earned = within(earnedSection())
  expect(earned.getByText('First Blood')).toBeInTheDocument()
  expect(earned.getAllByText('COMMON')).toHaveLength(1)
  expect(earned.getByText('2026-06-01')).toBeInTheDocument()
})

test('case 2: earned + uncommon + back click — both uncommon commendations render and back fires', () => {
  const onBack = renderRoom()

  const earned = within(earnedSection())
  expect(earned.getByText('Clean Commit')).toBeInTheDocument()
  expect(earned.getByText('No Hints Required')).toBeInTheDocument()
  expect(earned.getAllByText('UNCOMMON')).toHaveLength(2)

  fireEvent.click(screen.getByText('← back'))

  expect(onBack).toHaveBeenCalledTimes(1)
})

test('case 3: earned + rare + back click — no rare trophy has been earned yet', () => {
  const onBack = renderRoom()

  const earned = within(earnedSection())
  expect(earned.queryByText('RARE')).not.toBeInTheDocument()

  // The rare trophies all sit in the locked section instead.
  const locked = within(lockedSection())
  expect(locked.getByText('Branch Commander')).toBeInTheDocument()

  fireEvent.click(screen.getByText('← back'))

  expect(onBack).toHaveBeenCalledTimes(1)
})

test('case 4: earned + legendary + no back click — no legendary trophy has been earned yet', () => {
  renderRoom()

  const earned = within(earnedSection())
  expect(earned.queryByText('LEGENDARY')).not.toBeInTheDocument()

  const locked = within(lockedSection())
  expect(locked.getByText('Shadow Breach Neutralized')).toBeInTheDocument()
})

test('case 5: locked + common + back click — the locked common trophy renders and back fires', () => {
  const onBack = renderRoom()

  const locked = within(lockedSection())
  expect(locked.getByText('Shadow Hunter')).toBeInTheDocument()
  expect(locked.getAllByText('COMMON')).toHaveLength(1)

  fireEvent.click(screen.getByText('← back'))

  expect(onBack).toHaveBeenCalledTimes(1)
})

test('case 6: locked + uncommon + no back click — the locked uncommon trophy renders as classified', () => {
  renderRoom()

  expect(screen.getByText(/CLASSIFIED — 6/)).toBeInTheDocument()

  const locked = within(lockedSection())
  expect(locked.getByText('Streak Operative')).toBeInTheDocument()
  expect(locked.getAllByText('UNCOMMON')).toHaveLength(1)
})

test('case 7: locked + rare + no back click — all three rare trophies render as classified', () => {
  renderRoom()

  const locked = within(lockedSection())
  expect(locked.getByText('Branch Commander')).toBeInTheDocument()
  expect(locked.getByText('Zero Day')).toBeInTheDocument()
  expect(locked.getByText('Ghost Protocol')).toBeInTheDocument()
  expect(locked.getAllByText('RARE')).toHaveLength(3)
})

test('case 8: locked + legendary + back click — the legendary trophy renders and back fires', () => {
  const onBack = renderRoom()

  const locked = within(lockedSection())
  expect(locked.getByText('Shadow Breach Neutralized')).toBeInTheDocument()
  expect(locked.getAllByText('LEGENDARY')).toHaveLength(1)

  fireEvent.click(screen.getByText('← back'))

  expect(onBack).toHaveBeenCalledTimes(1)
})
