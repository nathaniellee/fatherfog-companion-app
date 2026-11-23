import { describe, expect, it } from 'vitest'
import {
  EMPTY_SAVES_DRAFT,
  EMPTY_STATS_DRAFT,
  SAVE_DICE,
  SAVE_KEYS,
  STAT_DICE,
  STAT_KEYS,
  completeDraft,
  createCharacter,
  createCharacterFromBase,
  parseAttributeEntry,
} from './creation'
import { seededRng } from './testing/rng'

describe('parseAttributeEntry', () => {
  it('accepts whole numbers inside the 6d10 range (6–60)', () => {
    expect(parseAttributeEntry('6', STAT_DICE)).toBe(6)
    expect(parseAttributeEntry('60', STAT_DICE)).toBe(60)
    expect(parseAttributeEntry(' 33 ', STAT_DICE)).toBe(33)
  })

  it('rejects out-of-range values for 6d10', () => {
    expect(parseAttributeEntry('5', STAT_DICE)).toBeNull()
    expect(parseAttributeEntry('61', STAT_DICE)).toBeNull()
  })

  it('uses the 5d10 range (5–50) for saves', () => {
    expect(parseAttributeEntry('5', SAVE_DICE)).toBe(5)
    expect(parseAttributeEntry('50', SAVE_DICE)).toBe(50)
    expect(parseAttributeEntry('51', SAVE_DICE)).toBeNull()
  })

  it('rejects blanks, decimals, signs and non-numeric text', () => {
    for (const raw of ['', '  ', '12.5', '-7', '+7', '1e1', 'abc', '3 0']) {
      expect(parseAttributeEntry(raw, STAT_DICE)).toBeNull()
    }
  })
})

describe('completeDraft', () => {
  it('returns null until every key has a value', () => {
    expect(completeDraft(EMPTY_STATS_DRAFT, STAT_KEYS)).toBeNull()
    expect(completeDraft({ ...EMPTY_STATS_DRAFT, strength: 30, will: 20 }, STAT_KEYS)).toBeNull()
  })

  it('returns a plain record once complete', () => {
    expect(completeDraft({ body: 5, mind: 50, spirit: 22 }, SAVE_KEYS)).toEqual({
      body: 5,
      mind: 50,
      spirit: 22,
    })
    expect(completeDraft(EMPTY_SAVES_DRAFT, SAVE_KEYS)).toBeNull()
  })
})

describe('createCharacterFromBase', () => {
  it('builds the same character createCharacter would from those rolls', () => {
    const rolled = createCharacter({ id: 'x' }, seededRng(3))
    expect(createCharacterFromBase({ id: 'x' }, rolled.baseStats, rolled.baseSaves)).toEqual(rolled)
  })
})
