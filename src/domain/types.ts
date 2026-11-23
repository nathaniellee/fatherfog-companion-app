/**
 * Fatherfog 0e — core domain types.
 *
 * Pure TypeScript only: no React, MUI, or DOM imports (see CLAUDE.md).
 * Section references (§N) point to docs/SPEC.md.
 */

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

/** A dice expression such as `2d10` → `{ count: 2, sides: 10 }`. */
export interface DiceExpression {
  count: number
  sides: number
}

/** A fixed amount, or an amount rolled at grant time. */
export type Quantity = number | DiceExpression

/** Random source returning a float in [0, 1). Injected for deterministic tests. */
export type Rng = () => number

// ---------------------------------------------------------------------------
// §1 Core attributes & derived state
// ---------------------------------------------------------------------------

export type StatKey = 'strength' | 'intellect' | 'will'
export type SaveKey = 'body' | 'mind' | 'spirit'

export type Stats = Record<StatKey, number>
export type Saves = Record<SaveKey, number>

export type StatModifiers = Partial<Record<StatKey, number>>
export type SaveModifiers = Partial<Record<SaveKey, number>>

export interface Pool {
  current: number
  max: number
}

export interface Waterskin {
  owned: boolean
  filled: boolean
}

// ---------------------------------------------------------------------------
// §5 Skills
// ---------------------------------------------------------------------------

export type SkillRank = 'common' | 'expert' | 'master'

export type CommonSkillId =
  | 'Tinkering'
  | 'Art'
  | 'Knowledge'
  | 'Athletics'
  | 'Foglore'
  | 'Boating'
  | 'Riding'
  | 'Animals'
  | 'Basic Care'
  | 'Foraging'
  | 'Alchemy'
  | 'Fighting'
  | 'Archery'
  | 'Firearms'
  | 'Throwing'
  | 'Hiding'
  | 'Performance'
  | 'Fishing'
  | 'Literacy'
  | 'Perception'

export type ExpertSkillId =
  | 'Trade Specialty'
  | 'Smithing'
  | 'Art Specialty'
  | 'Mysticism'
  | 'Athletic Specialty'
  | 'Fog Vision'
  | 'Piloting'
  | 'Trick Riding'
  | 'Animal Specialty'
  | 'Anatomy'
  | 'Botany'
  | 'Explosives'
  | 'Unarmed Combat'
  | 'Navigation'
  | 'Weapon Specialty'
  | 'Sleight of Hand'
  | 'Sneaking'
  | 'Performance Specialty'
  | 'Disguise'
  | 'Language'
  | 'Understanding'
  | 'Tracking'

export type MasterSkillId =
  | 'Forge Specialty'
  | 'Fog Whispers'
  | 'Lock Picking'
  | 'Command Specialty'
  | 'Animal Familiar'
  | 'Surgery'
  | 'Medicine'
  | 'Cartography'
  | 'Weapon Mastery'
  | 'Cooking'
  | 'Pickpocketing'
  | 'Persuasion'
  | 'Language Specialty'
  | 'Hypervigilance'

/** All 56 skills on the authoritative sheet graph. */
export type SkillId = CommonSkillId | ExpertSkillId | MasterSkillId

/** Static definition of a skill node in the prerequisite graph. */
export interface SkillDefinition {
  id: SkillId
  rank: SkillRank
  /**
   * OR-logic: owning ANY listed skill satisfies the prerequisite.
   * An empty array means no prerequisite.
   */
  prerequisites: readonly SkillId[]
  /** True for `*Specialty` / `*Mastery` / `*Familiar` skills that need a user label. */
  customizable: boolean
}

export type SkillSource = 'class' | 'classChoice' | 'coinStory' | 'legacyArtifact' | 'purchase'

/**
 * A skill the character owns. Customizable skills may appear multiple times
 * with distinct `customLabel`s (e.g. "Handaxe" → "Handaxe Specialty").
 */
export interface OwnedSkill {
  skillId: SkillId
  customLabel?: string
  source: SkillSource
}

// ---------------------------------------------------------------------------
// §3 Equipment catalog & scarcity
// ---------------------------------------------------------------------------

export type ScarcityTier = 'plentiful' | 'common' | 'scarce' | 'rare' | 'veryRare' | 'unheardOf'

export type EquipmentCategory = 'general' | 'melee' | 'defensive' | 'ranged'

export type Handedness = 'oneHanded' | 'twoHanded'

/** Stable catalog key, e.g. `"hand-weapon"`. Concrete IDs live in `data/equipment.ts`. */
export type CatalogItemId = string

export interface EquipmentItem {
  id: CatalogItemId
  name: string
  category: EquipmentCategory
  cost: number
  scarcity: ScarcityTier
  /** Flat Defense granted while equipped (Leather +1, Shield +2, Chain +3, Plate +5, Staff +1). */
  defenseBonus?: number
  /** Melee weapons only — drives off-hand and Great Weapon rules. */
  handedness?: Handedness
  /** True for Shield; blocks the off-hand weapon Defense bonus. */
  isShield?: boolean
  description?: string
}

/** A concrete item a character carries. Rations/waterskin are NOT stored here. */
export interface InventoryItem {
  /** Unique per-character instance ID (allows duplicate catalog items). */
  instanceId: string
  /** Undefined for freeform narrative items not in the catalog. */
  catalogItemId?: CatalogItemId
  name: string
  customName?: string
  quantity: number
  equipped: boolean
  /** Set when equipped as the off-hand one-handed melee weapon (+1 Defense). */
  offHand?: boolean
}

export interface PurchaseAttempt {
  itemId: CatalogItemId
  roll: number
  availabilityPercent: number
  available: boolean
}

// ---------------------------------------------------------------------------
// §3 Rucksacks
// ---------------------------------------------------------------------------

export type RucksackId =
  | 'Excavation'
  | 'Exertion'
  | 'Exploration'
  | 'Examination'
  | 'Experimentation'
  | 'Extraction'
  | 'Excommunication'
  | 'Extermination'
  | 'Exhibition'

export type RucksackGrant =
  | {
      kind: 'item'
      catalogItemId: CatalogItemId
      quantity: Quantity
      customName?: string
    }
  | {
      kind: 'rations'
      grantRations: number
    }
  | {
      kind: 'waterskin'
      filled: boolean
    }

export interface RucksackEntry {
  /** Text shown on the selection card. */
  displayLabel: string
  grant: RucksackGrant
}

export interface RucksackDefinition {
  id: RucksackId
  entries: readonly RucksackEntry[]
}

// ---------------------------------------------------------------------------
// §2 Classes
// ---------------------------------------------------------------------------

export type ClassId = 'worker' | 'philosopher' | 'stranger' | 'hunter'

export interface ClassTrait {
  name: string
  description: string
}

/** A "choose exactly one" starting-skill slot. */
export interface SkillChoice {
  options: readonly SkillId[]
}

export interface ClassDefinition {
  id: ClassId
  name: string
  statModifiers: StatModifiers
  saveModifiers: SaveModifiers
  fixedSkills: readonly SkillId[]
  skillChoices: readonly SkillChoice[]
  startingSkillPoints: number
  traits: readonly ClassTrait[]
  /** Always includes `Exploration` plus two class-unique rucksacks. */
  eligibleRucksacks: readonly [RucksackId, RucksackId, RucksackId]
}

// ---------------------------------------------------------------------------
// §4 Flavor, coin & legacy tables
// ---------------------------------------------------------------------------

export type CloakColor =
  | 'Black'
  | 'Red'
  | 'Orange'
  | 'Yellow'
  | 'Green'
  | 'Blue'
  | 'Purple'
  | 'Grey'
  | 'White'
  | 'Brown'

/** One row of a 0-indexed d10/d100 table. */
export interface TableEntry {
  /** 0–9 or 0–99. */
  index: number
  title: string
  description?: string
}

export type CoinStoryEffect =
  | { kind: 'none' }
  | { kind: 'skillPoints'; amount: number }
  | { kind: 'grantSkill'; skillId: CommonSkillId }
  | { kind: 'maxHope'; delta: number }
  | { kind: 'setCoin'; coin: number }

export interface CoinStoryEntry extends TableEntry {
  /** Starting coin granted by this story (e.g. `1c`). */
  coin: number
  effect: CoinStoryEffect
}

export type LegacyArtifactEffect =
  | { kind: 'none' }
  | { kind: 'grantSkill'; skillId: SkillId }
  | { kind: 'defense'; amount: number }
  | { kind: 'maxHope'; delta: number }

export interface LegacyArtifactEntry extends TableEntry {
  effect: LegacyArtifactEffect
}

/** The character's owned legacy artifact (opt-in, secret by default). */
export interface LegacyArtifact {
  index: number
  isSecret: true
  /** UI reveal toggle state; persisted so the sheet reopens masked or not. */
  revealed: boolean
}

// ---------------------------------------------------------------------------
// §6 Rolls, Hope/Despair & Death
// ---------------------------------------------------------------------------

export type RollModifier = 'none' | 'advantage' | 'disadvantage'

export type RollKind = 'stat' | 'save' | 'hope' | 'death'

export type RollOutcome = 'criticalSuccess' | 'success' | 'failure' | 'criticalFailure'

export interface RollRequest {
  kind: RollKind
  /** Required for `stat` rolls. */
  stat?: StatKey
  /** Required for `save` rolls (`death` is always a Body save). */
  save?: SaveKey
  /** Optional single owned skill adding its rank bonus. */
  skill?: OwnedSkill
  modifier: RollModifier
}

export interface RollResult {
  request: RollRequest
  /** Every d100 rolled (two when advantage/disadvantage applied). */
  dice: readonly number[]
  /** The die actually used after advantage/disadvantage. */
  roll: number
  targetNumber: number
  outcome: RollOutcome
}

/** A lasting condition from the Despair (0–99) or Death (0–74) table. */
export interface Condition {
  source: 'despair' | 'death'
  index: number
  title: string
}

// ---------------------------------------------------------------------------
// Character (serializable root)
// ---------------------------------------------------------------------------

export const CHARACTER_SCHEMA_VERSION = 1

export interface Character {
  schemaVersion: typeof CHARACTER_SCHEMA_VERSION
  id: string
  name: string
  classId: ClassId | null

  /** Rolled values before class modifiers. */
  baseStats: Stats
  baseSaves: Saves
  /** Final values after class modifiers. */
  stats: Stats
  saves: Saves

  health: Pool
  hope: Pool
  /** Derived from equipped gear + legacy artifact; cached for display. */
  defense: number
  isDead: boolean

  skills: OwnedSkill[]
  skillPoints: number

  rucksackId: RucksackId | null
  inventory: InventoryItem[]
  rations: number
  waterskin: Waterskin
  /** May be negative (Coin Story 99 → -99). */
  coin: number

  cloakColor: CloakColor | null
  broochIndex: number | null
  trinketIndex: number | null
  coinStoryIndex: number | null
  legacyArtifact: LegacyArtifact | null

  conditions: Condition[]
  notes: string
}
