import { describe, expect, expectTypeOf, it } from 'vitest'
import { CHARACTER_SCHEMA_VERSION, type Character, type SkillId } from './types'

describe('domain types', () => {
  it('exposes a schema version for serialized characters', () => {
    expect(CHARACTER_SCHEMA_VERSION).toBe(1)
    expectTypeOf<Character['schemaVersion']>().toEqualTypeOf<1>()
  })

  it('treats customizable skills as SkillIds', () => {
    expectTypeOf<'Weapon Specialty'>().toExtend<SkillId>()
    expectTypeOf<'Unnatural Ability'>().not.toExtend<SkillId>()
  })
})
