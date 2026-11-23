import type { DiceExpression, Rng } from './types'

/**
 * Rolls one die with faces `1..sides`.
 * Defensive against an RNG that returns exactly 1 (outside its [0, 1) contract).
 */
export function rollDie(sides: number, rng: Rng = Math.random): number {
  if (!Number.isInteger(sides) || sides < 1) {
    throw new RangeError(`Die must have a positive integer number of sides, got ${sides}`)
  }
  const face = Math.floor(rng() * sides) + 1
  return Math.min(sides, Math.max(1, face))
}

/** Rolls `count` dice of `sides` faces and returns each face. */
export function rollDiceFaces({ count, sides }: DiceExpression, rng: Rng = Math.random): number[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Dice count must be a non-negative integer, got ${count}`)
  }
  return Array.from({ length: count }, () => rollDie(sides, rng))
}

/** Inclusive min/max total for a dice expression (e.g. `6d10` → 6–60). */
export function diceRange({ count, sides }: DiceExpression): { min: number; max: number } {
  return { min: count, max: count * sides }
}

/** Formats a dice expression as `NdS`. */
export function formatDice({ count, sides }: DiceExpression): string {
  return `${count}d${sides}`
}

/** Rolls a dice expression (e.g. `6d10`) and returns the sum. */
export function rollDice(expression: DiceExpression, rng: Rng = Math.random): number {
  return rollDiceFaces(expression, rng).reduce((sum, face) => sum + face, 0)
}
