import { describe, expect, it } from 'vitest'
import { diceRange, formatDice, rollDice, rollDiceFaces, rollDie } from './dice'
import { constantRng, facesRng, seededRng } from './testing/rng'

describe('rollDie', () => {
  it('maps the RNG range onto faces 1..sides', () => {
    expect(rollDie(10, constantRng(0))).toBe(1)
    expect(rollDie(10, constantRng(0.999999))).toBe(10)
    expect(rollDie(10, constantRng(0.45))).toBe(5)
  })

  it('clamps an out-of-contract RNG value of 1 to the top face', () => {
    expect(rollDie(10, constantRng(1))).toBe(10)
  })

  it('stays within bounds over many seeded rolls and hits every face', () => {
    const rng = seededRng(42)
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) {
      const face = rollDie(10, rng)
      expect(face).toBeGreaterThanOrEqual(1)
      expect(face).toBeLessThanOrEqual(10)
      expect(Number.isInteger(face)).toBe(true)
      seen.add(face)
    }
    expect(seen.size).toBe(10)
  })

  it('rejects invalid side counts', () => {
    expect(() => rollDie(0)).toThrow(RangeError)
    expect(() => rollDie(2.5)).toThrow(RangeError)
  })
})

describe('rollDice', () => {
  it('sums faces deterministically from an injected RNG', () => {
    const rng = facesRng([1, 2, 3, 4, 5, 6])
    expect(rollDiceFaces({ count: 6, sides: 10 }, rng)).toEqual([1, 2, 3, 4, 5, 6])
    expect(rollDice({ count: 6, sides: 10 }, facesRng([1, 2, 3, 4, 5, 6]))).toBe(21)
  })

  it('6d10 stays within 6–60 and 5d10 within 5–50', () => {
    const rng = seededRng(7)
    for (let i = 0; i < 500; i++) {
      const stat = rollDice({ count: 6, sides: 10 }, rng)
      const save = rollDice({ count: 5, sides: 10 }, rng)
      expect(stat).toBeGreaterThanOrEqual(6)
      expect(stat).toBeLessThanOrEqual(60)
      expect(save).toBeGreaterThanOrEqual(5)
      expect(save).toBeLessThanOrEqual(50)
    }
    expect(rollDice({ count: 6, sides: 10 }, constantRng(0))).toBe(6)
    expect(rollDice({ count: 6, sides: 10 }, constantRng(0.999999))).toBe(60)
    expect(rollDice({ count: 5, sides: 10 }, constantRng(0))).toBe(5)
    expect(rollDice({ count: 5, sides: 10 }, constantRng(0.999999))).toBe(50)
  })

  it('returns 0 for zero dice and rejects negative counts', () => {
    expect(rollDice({ count: 0, sides: 10 })).toBe(0)
    expect(() => rollDice({ count: -1, sides: 10 })).toThrow(RangeError)
  })
})

describe('diceRange / formatDice', () => {
  it('reports inclusive totals and NdS notation', () => {
    expect(diceRange({ count: 6, sides: 10 })).toEqual({ min: 6, max: 60 })
    expect(diceRange({ count: 5, sides: 10 })).toEqual({ min: 5, max: 50 })
    expect(formatDice({ count: 6, sides: 10 })).toBe('6d10')
  })
})
