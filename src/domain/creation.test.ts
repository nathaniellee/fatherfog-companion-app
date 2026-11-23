import { describe, expect, it } from 'vitest'
import {
  applyClass,
  createCharacter,
  rollBaseSaves,
  rollBaseStats,
  selectClassSkillChoice,
} from './creation'
import { CLASS_IDS, CLASSES } from './data/classes'
import { constantRng, facesRng, seededRng } from './testing/rng'
import type { Character, ClassId, Saves, Stats } from './types'

/** Every d10 shows 5 → base stats 30, base saves 25. */
const midRng = constantRng(0.45)
/** Every d10 shows 1 → base stats 6, base saves 5. */
const lowRng = constantRng(0)

const newChar = (rng = midRng): Character => createCharacter({ id: 'c1' }, rng)
const skillIds = (c: Character) => c.skills.map((s) => s.skillId)

describe('rollBaseStats / rollBaseSaves', () => {
  it('rolls each stat as 6d10 and each save as 5d10, in key order', () => {
    // strength: 1..6 = 21, intellect: 6 × 10 = 60, will: 6 × 1 = 6
    const statRng = facesRng([1, 2, 3, 4, 5, 6, ...Array(6).fill(10), ...Array(6).fill(1)])
    expect(rollBaseStats(statRng)).toEqual({ strength: 21, intellect: 60, will: 6 })

    // body: 5 × 1, mind: 5 × 10, spirit: 1..5 = 15
    const saveRng = facesRng([...Array(5).fill(1), ...Array(5).fill(10), 1, 2, 3, 4, 5])
    expect(rollBaseSaves(saveRng)).toEqual({ body: 5, mind: 50, spirit: 15 })
  })

  it('is reproducible for the same seed', () => {
    expect(createCharacter({ id: 'a' }, seededRng(99))).toEqual(
      createCharacter({ id: 'a' }, seededRng(99)),
    )
  })
})

describe('createCharacter', () => {
  it('starts classless with final values equal to base rolls', () => {
    const c = newChar()
    expect(c.classId).toBeNull()
    expect(c.baseStats).toEqual({ strength: 30, intellect: 30, will: 30 })
    expect(c.baseSaves).toEqual({ body: 25, mind: 25, spirit: 25 })
    expect(c.stats).toEqual(c.baseStats)
    expect(c.saves).toEqual(c.baseSaves)
    expect(c.skills).toEqual([])
    expect(c.skillPoints).toBe(0)
  })

  it('derives Health from Strength and starts Hope at 100', () => {
    const c = newChar()
    expect(c.health).toEqual({ max: 30, current: 30 })
    expect(c.hope).toEqual({ max: 100, current: 100 })
  })
})

describe('applyClass modifiers', () => {
  const expected: Record<ClassId, { stats: Stats; saves: Saves; skillPoints: number }> = {
    worker: {
      stats: { strength: 40, intellect: 30, will: 30 },
      saves: { body: 30, mind: 30, spirit: 30 },
      skillPoints: 10,
    },
    philosopher: {
      stats: { strength: 30, intellect: 40, will: 30 },
      saves: { body: 25, mind: 30, spirit: 25 },
      skillPoints: 7,
    },
    stranger: {
      stats: { strength: 30, intellect: 35, will: 35 },
      saves: { body: 15, mind: 65, spirit: 15 },
      skillPoints: 5,
    },
    hunter: {
      stats: { strength: 30, intellect: 30, will: 40 },
      saves: { body: 30, mind: 25, spirit: 35 },
      skillPoints: 5,
    },
  }

  it.each(CLASS_IDS)('%s applies its stat/save modifiers and Skill Points', (classId) => {
    const base = newChar()
    const c = applyClass(base, classId)
    expect(c.stats).toEqual(expected[classId].stats)
    expect(c.saves).toEqual(expected[classId].saves)
    expect(c.skillPoints).toBe(expected[classId].skillPoints)
    expect(c.health).toEqual({ max: c.stats.strength, current: c.stats.strength })
    expect(c.hope).toEqual({ max: 100, current: 100 })
    // Base rolls are never mutated.
    expect(c.baseStats).toEqual(base.baseStats)
    expect(c.baseSaves).toEqual(base.baseSaves)
  })

  it.each(CLASS_IDS)('%s grants exactly its fixed starting skills', (classId) => {
    const c = applyClass(newChar(), classId)
    expect(skillIds(c)).toEqual(CLASSES[classId].fixedSkills)
    expect(c.skills.every((s) => s.source === 'class')).toBe(true)
  })

  it('Worker Health uses class-modified Strength', () => {
    expect(applyClass(newChar(), 'worker').health).toEqual({ max: 40, current: 40 })
  })

  it('clamps Stranger Body/Spirit at 1 on a minimum 5d10 roll', () => {
    const c = applyClass(newChar(lowRng), 'stranger')
    expect(c.baseSaves).toEqual({ body: 5, mind: 5, spirit: 5 })
    expect(c.saves).toEqual({ body: 1, mind: 45, spirit: 1 })
    expect(c.stats).toEqual({ strength: 6, intellect: 11, will: 11 })
    expect(c.health).toEqual({ max: 6, current: 6 })
  })

  it('keeps the floor at 1 for borderline values (base 10 - 10 → 1, base 11 - 10 → 1)', () => {
    const base = { ...newChar(), baseSaves: { body: 10, mind: 5, spirit: 11 } }
    const c = applyClass(base, 'stranger')
    expect(c.saves.body).toBe(1)
    expect(c.saves.spirit).toBe(1)
  })
})

describe('class switching', () => {
  /** Worker with a choice made, points spent, a purchased skill, and a class rucksack. */
  function dirtyWorker(): Character {
    const chosen = selectClassSkillChoice(applyClass(newChar(), 'worker'), 0, 'Alchemy')
    return {
      ...chosen,
      skillPoints: 0,
      skills: [...chosen.skills, { skillId: 'Smithing', source: 'purchase' }],
      rucksackId: 'Exertion',
    }
  }

  it('applying the same class twice equals applying it once', () => {
    for (const classId of CLASS_IDS) {
      const once = applyClass(newChar(), classId)
      expect(applyClass(once, classId)).toEqual(once)
    }
  })

  it('re-selecting the current class preserves skill choices', () => {
    const worker = dirtyWorker()
    expect(applyClass(worker, 'worker')).toEqual(worker)
  })

  it('switching resets stats, saves, Health, Skill Points, class skills and rucksack', () => {
    const hunter = applyClass(dirtyWorker(), 'hunter')
    expect(hunter.classId).toBe('hunter')
    expect(hunter.stats).toEqual({ strength: 30, intellect: 30, will: 40 })
    expect(hunter.saves).toEqual({ body: 30, mind: 25, spirit: 35 })
    expect(hunter.health).toEqual({ max: 30, current: 30 })
    expect(hunter.skillPoints).toBe(5)
    expect(hunter.skills).toEqual([])
    expect(hunter.rucksackId).toBeNull()
  })

  it('switching away and back matches a fresh application', () => {
    const roundTrip = applyClass(applyClass(dirtyWorker(), 'stranger'), 'worker')
    expect(roundTrip).toEqual(applyClass(newChar(), 'worker'))
  })

  it.each(CLASS_IDS)('switching from every class to %s leaves no stale state', (target) => {
    const fresh = applyClass(newChar(), target)
    for (const from of CLASS_IDS.filter((id) => id !== target)) {
      expect(applyClass(applyClass(newChar(), from), target)).toEqual(fresh)
    }
  })

  it('keeps the shared Exploration rucksack across classes', () => {
    const worker = { ...applyClass(newChar(), 'worker'), rucksackId: 'Exploration' as const }
    expect(applyClass(worker, 'hunter').rucksackId).toBe('Exploration')
  })

  it('keeps Coin Story / Legacy Artifact skills and does not duplicate a fixed skill', () => {
    const c: Character = {
      ...newChar(),
      skills: [
        { skillId: 'Tinkering', source: 'coinStory' },
        { skillId: 'Cooking', source: 'legacyArtifact' },
      ],
    }
    const worker = applyClass(c, 'worker')
    expect(worker.skills).toEqual(c.skills)
    const hunter = applyClass(worker, 'hunter')
    expect(hunter.skills).toEqual(c.skills)
  })
})

describe('selectClassSkillChoice', () => {
  it('fills and replaces a slot without touching other slots', () => {
    let c = applyClass(newChar(), 'philosopher')
    c = selectClassSkillChoice(c, 0, 'Basic Care')
    c = selectClassSkillChoice(c, 1, 'Perception')
    c = selectClassSkillChoice(c, 0, 'Alchemy')
    expect(skillIds(c)).toEqual(['Literacy', 'Perception', 'Alchemy'])
  })

  it('rejects invalid usage', () => {
    expect(() => selectClassSkillChoice(newChar(), 0, 'Alchemy')).toThrow(/Select a class/)
    const worker = applyClass(newChar(), 'worker')
    expect(() => selectClassSkillChoice(worker, 1, 'Alchemy')).toThrow(RangeError)
    expect(() => selectClassSkillChoice(worker, 0, 'Archery')).toThrow(/not an option/)
    expect(() => selectClassSkillChoice(applyClass(newChar(), 'stranger'), 0, 'Alchemy')).toThrow(
      RangeError,
    )
  })

  it('rejects a choice already owned from another source', () => {
    const c: Character = {
      ...applyClass(newChar(), 'worker'),
      skills: [{ skillId: 'Alchemy', source: 'coinStory' }],
    }
    expect(() => selectClassSkillChoice(c, 0, 'Alchemy')).toThrow(/already owned/)
    expect(skillIds(selectClassSkillChoice(c, 0, 'Boating'))).toEqual(['Alchemy', 'Boating'])
  })
})

describe('class data', () => {
  it.each(CLASS_IDS)('%s offers Exploration plus two unique rucksacks', (classId) => {
    const { eligibleRucksacks } = CLASSES[classId]
    expect(eligibleRucksacks).toContain('Exploration')
    expect(new Set(eligibleRucksacks).size).toBe(3)
  })

  it('class-unique rucksacks cover all 8 non-shared rucksacks exactly once', () => {
    const unique = CLASS_IDS.flatMap((id) =>
      CLASSES[id].eligibleRucksacks.filter((r) => r !== 'Exploration'),
    )
    expect(new Set(unique).size).toBe(8)
    expect(unique).toHaveLength(8)
  })
})
