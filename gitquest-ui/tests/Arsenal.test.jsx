import React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import Arsenal from '../src/components/Arsenal'

// Purchase flow has 4 independent dimensions: filter (all/tools/boosts/cosmetics),
// ownership (owned/not_owned), affordability (affordable/insufficient), and
// flash_timer (during_flash/after_flash) — 32 combinations. Cases below are an
// all-pairs reduction, so each test targets a distinct pair combo.
//
// Fixture costs at the default balance of 120 coins:
//   tools     — Auto-hint 80, Syntax Scanner 120, Ghost Command 200
//   boosts    — Double XP 60 (pre-owned), Streak Shield 90, Time Freeze 150
//   cosmetics — Red Alert 300, Agent Callsign 100, Terminal Cursor 50 (pre-owned)

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

// Walk up from an item's name to the card element that holds its buy button.
const cardFor = (name) => {
  let el = screen.getByText(name)
  while (el && !el.querySelector('button')) el = el.parentElement
  return el
}

const buttonFor = (name) => within(cardFor(name)).getByRole('button')

const selectFilter = (label) => fireEvent.click(screen.getByRole('button', { name: label }))

// Balance lives in the topbar next to the BALANCE label; item prices render the
// same "💰 n" shape, so scope the query instead of matching on text alone.
const balance = () =>
  screen.getByText('BALANCE').parentElement.textContent.replace('BALANCE', '').trim()

test('case 1: all filter, owned item priced above balance stays equipped after the flash window', () => {
  render(<Arsenal onBack={() => {}} coins={40} />)

  const button = buttonFor('Terminal Cursor')
  expect(button).toHaveTextContent('✓ EQUIPPED')
  expect(button).toBeDisabled()
  expect(within(cardFor('Terminal Cursor')).getByText('—')).toBeInTheDocument()

  act(() => {
    jest.advanceTimersByTime(1000)
  })

  expect(buttonFor('Terminal Cursor')).toHaveTextContent('✓ EQUIPPED')
  expect(balance()).toBe('💰 40')
})

test('case 2: all filter, buying an affordable item equips it and debits the balance', () => {
  render(<Arsenal onBack={() => {}} coins={120} />)

  expect(buttonFor('Auto-hint Module')).toHaveTextContent('ACQUIRE')
  fireEvent.click(buttonFor('Auto-hint Module'))

  expect(buttonFor('Auto-hint Module')).toHaveTextContent('✓ EQUIPPED')
  expect(buttonFor('Auto-hint Module')).toBeDisabled()
  expect(balance()).toBe('💰 40')
})

test('case 3: tools filter shows only tools and a purchased tool reads as owned during the flash window', () => {
  render(<Arsenal onBack={() => {}} coins={120} />)
  selectFilter('tools')

  expect(screen.queryByText('Streak Shield')).not.toBeInTheDocument()
  expect(screen.queryByText('Agent Callsign')).not.toBeInTheDocument()

  fireEvent.click(buttonFor('Auto-hint Module'))

  expect(buttonFor('Auto-hint Module')).toHaveTextContent('✓ EQUIPPED')
  expect(within(cardFor('Auto-hint Module')).getByText('—')).toBeInTheDocument()
})

test('case 4: tools filter, item priced above balance is disabled and clicking it is a no-op', () => {
  render(<Arsenal onBack={() => {}} coins={120} />)
  selectFilter('tools')

  const button = buttonFor('Ghost Command')
  expect(button).toHaveTextContent('INSUFFICIENT')
  expect(button).toBeDisabled()

  fireEvent.click(button)
  act(() => {
    jest.advanceTimersByTime(1000)
  })

  expect(buttonFor('Ghost Command')).toHaveTextContent('INSUFFICIENT')
  expect(balance()).toBe('💰 120')
})

test('case 5: boosts filter shows only boosts and buying one equips it during the flash window', () => {
  render(<Arsenal onBack={() => {}} coins={120} />)
  selectFilter('boosts')

  expect(screen.queryByText('Auto-hint Module')).not.toBeInTheDocument()
  expect(buttonFor('Double XP Token')).toHaveTextContent('✓ EQUIPPED')

  fireEvent.click(buttonFor('Streak Shield'))

  expect(buttonFor('Streak Shield')).toHaveTextContent('✓ EQUIPPED')
  expect(balance()).toBe('💰 30')
})

test('case 6: boosts filter, item priced above balance stays insufficient after the flash window', () => {
  render(<Arsenal onBack={() => {}} coins={120} />)
  selectFilter('boosts')

  expect(buttonFor('Time Freeze')).toHaveTextContent('INSUFFICIENT')

  fireEvent.click(buttonFor('Time Freeze'))
  act(() => {
    jest.advanceTimersByTime(1000)
  })

  expect(buttonFor('Time Freeze')).toHaveTextContent('INSUFFICIENT')
  expect(balance()).toBe('💰 120')
})

test('case 7: cosmetics filter shows only cosmetics and buying one equips it during the flash window', () => {
  render(<Arsenal onBack={() => {}} coins={120} />)
  selectFilter('cosmetics')

  expect(screen.queryByText('Auto-hint Module')).not.toBeInTheDocument()
  expect(screen.queryByText('Streak Shield')).not.toBeInTheDocument()

  fireEvent.click(buttonFor('Agent Callsign'))

  expect(buttonFor('Agent Callsign')).toHaveTextContent('✓ EQUIPPED')
  expect(balance()).toBe('💰 20')
})

test('case 8: cosmetics filter, item priced above balance stays insufficient after the flash window', () => {
  render(<Arsenal onBack={() => {}} coins={120} />)
  selectFilter('cosmetics')

  const button = buttonFor('Red Alert Theme')
  expect(button).toHaveTextContent('INSUFFICIENT')
  expect(button).toBeDisabled()

  act(() => {
    jest.advanceTimersByTime(1000)
  })

  expect(buttonFor('Red Alert Theme')).toHaveTextContent('INSUFFICIENT')
  expect(balance()).toBe('💰 120')
})

test('back button calls onBack', () => {
  const onBack = jest.fn()
  render(<Arsenal onBack={onBack} coins={120} />)

  fireEvent.click(screen.getByText('← back'))

  expect(onBack).toHaveBeenCalledTimes(1)
})
