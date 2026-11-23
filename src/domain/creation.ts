/**
 * Character creation: attribute rolls, class application, derived pools.
 * Pure functions only — every function returns a new Character.
 */
import { getClass } from './data/classes'
import { rollDice } from './dice'
import {
  CHARACTER_SCHEMA_VERSION,
  type Character,
  type ClassId,
  type DiceExpression,
  type OwnedSkill,
  type Pool,
  type Rng,
  type SaveKey,
  type SaveModifiers,
  type Saves,
  type SkillId,
  type SkillSource,
  type StatKey,
  type StatModifiers,
  type Stats,
} from './types'

export const STAT_DICE: DiceExpression = { count: 6, sides: 10 }
export const SAVE_DICE: DiceExpression = { count: 5, sides: 10 }
export const STARTING_MAX_HOPE = 100
/** Class modifiers can never push a stat or save below this floor. */
export const MIN_ATTRIBUTE_VALUE = 1

export const STAT_KEYS: readonly StatKey[] = ['strength', 'intellect', 'will']
export const SAVE_KEYS: readonly SaveKey[] = ['body', 'mind', 'spirit']

/** Skill sources owned by the class; cleared whenever the class changes. */
const CLASS_TIED_SOURCES: ReadonlySet<SkillSource> = new Set(['class', 'classChoice', 'purchase'])

// ---------------------------------------------------------------------------
// Rolling
// ---------------------------------------------------------------------------

export function rollBaseStats(rng: Rng = Math.random): Stats {
  return {
    strength: rollDice(STAT_DICE, rng),
    intellect: rollDice(STAT_DICE, rng),
    will: rollDice(STAT_DICE, rng),
  }
}

export function rollBaseSaves(rng: Rng = Math.random): Saves {
  return {
    body: rollDice(SAVE_DICE, rng),
    mind: rollDice(SAVE_DICE, rng),
    spirit: rollDice(SAVE_DICE, rng),
  }
}

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

function applyModifiers<K extends string>(
  base: Record<K, number>,
  modifiers: Partial<Record<K, number>>,
  keys: readonly K[],
): Record<K, number> {
  const result = {} as Record<K, number>
  for (const key of keys) {
    result[key] = Math.max(MIN_ATTRIBUTE_VALUE, base[key] + (modifiers[key] ?? 0))
  }
  return result
}

export function applyStatModifiers(base: Stats, modifiers: StatModifiers): Stats {
  return applyModifiers(base, modifiers, STAT_KEYS)
}

export function applySaveModifiers(base: Saves, modifiers: SaveModifiers): Saves {
  return applyModifiers(base, modifiers, SAVE_KEYS)
}

/** `maxHealth` = final Strength; `currentHealth` starts full. */
export function deriveStartingHealth(stats: Stats): Pool {
  return { max: stats.strength, current: stats.strength }
}

export function deriveStartingHope(): Pool {
  return { max: STARTING_MAX_HOPE, current: STARTING_MAX_HOPE }
}

/** Recomputes final stats, saves, and Health from base rolls and the current class. */
function recomputeAttributes(character: Character): Character {
  const cls = character.classId ? getClass(character.classId) : null
  const stats = applyStatModifiers(character.baseStats, cls?.statModifiers ?? {})
  const saves = applySaveModifiers(character.baseSaves, cls?.saveModifiers ?? {})
  return { ...character, stats, saves, health: deriveStartingHealth(stats) }
}

// ---------------------------------------------------------------------------
// Character lifecycle
// ---------------------------------------------------------------------------

export interface NewCharacterOptions {
  id: string
  name?: string
}

/** Creates a classless character with freshly rolled base stats and saves. */
export function createCharacter(
  { id, name = '' }: NewCharacterOptions,
  rng: Rng = Math.random,
): Character {
  const baseStats = rollBaseStats(rng)
  const baseSaves = rollBaseSaves(rng)
  return recomputeAttributes({
    schemaVersion: CHARACTER_SCHEMA_VERSION,
    id,
    name,
    classId: null,
    baseStats,
    baseSaves,
    stats: baseStats,
    saves: baseSaves,
    health: deriveStartingHealth(baseStats),
    hope: deriveStartingHope(),
    defense: 0,
    isDead: false,
    skills: [],
    skillPoints: 0,
    rucksackId: null,
    inventory: [],
    rations: 0,
    waterskin: { owned: false, filled: false },
    coin: 0,
    cloakColor: null,
    broochIndex: null,
    trinketIndex: null,
    coinStoryIndex: null,
    legacyArtifact: null,
    conditions: [],
    notes: '',
  })
}

function ownsSkill(skills: readonly OwnedSkill[], skillId: SkillId): boolean {
  return skills.some((s) => s.skillId === skillId && s.customLabel === undefined)
}

/**
 * Selects a class.
 *
 * - Switching to a different class resets all class-tied state: fixed and chosen
 *   class skills, purchased skills (refunding spent Skill Points), and any
 *   rucksack not eligible for the new class (`Exploration` is kept).
 * - Re-selecting the current class only recomputes attributes, so a stray
 *   re-tap does not wipe the player's skill choices.
 *
 * Both paths are idempotent: applying the same class twice equals applying it once.
 * Skills from Coin Stories and Legacy Artifacts are never removed.
 */
export function applyClass(character: Character, classId: ClassId): Character {
  if (character.classId === classId) {
    return recomputeAttributes(character)
  }

  const cls = getClass(classId)
  const retained = character.skills.filter((s) => !CLASS_TIED_SOURCES.has(s.source))
  const fixed: OwnedSkill[] = cls.fixedSkills
    .filter((skillId) => !ownsSkill(retained, skillId))
    .map((skillId) => ({ skillId, source: 'class' }))

  const rucksackId =
    character.rucksackId && cls.eligibleRucksacks.includes(character.rucksackId)
      ? character.rucksackId
      : null

  return recomputeAttributes({
    ...character,
    classId,
    skills: [...retained, ...fixed],
    skillPoints: cls.startingSkillPoints,
    rucksackId,
  })
}

/**
 * Fills (or replaces) one of the current class's "choose 1" starting-skill slots.
 * Throws on an invalid slot/option or if the skill is already owned from another source.
 */
export function selectClassSkillChoice(
  character: Character,
  choiceIndex: number,
  skillId: SkillId,
): Character {
  if (!character.classId) {
    throw new Error('Select a class before choosing class skills')
  }
  const slot = getClass(character.classId).skillChoices[choiceIndex]
  if (!slot) {
    throw new RangeError(`Class ${character.classId} has no skill choice at index ${choiceIndex}`)
  }
  if (!slot.options.includes(skillId)) {
    throw new Error(`${skillId} is not an option for choice ${choiceIndex}`)
  }

  const withoutSlot = character.skills.filter(
    (s) => !(s.source === 'classChoice' && slot.options.includes(s.skillId)),
  )
  if (ownsSkill(withoutSlot, skillId)) {
    throw new Error(`${skillId} is already owned`)
  }

  return { ...character, skills: [...withoutSlot, { skillId, source: 'classChoice' }] }
}
