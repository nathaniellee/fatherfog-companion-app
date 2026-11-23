import type { ClassDefinition, ClassId } from '../types'

/** The four playable classes (docs/SPEC.md §2). */
export const CLASSES: Readonly<Record<ClassId, ClassDefinition>> = {
  worker: {
    id: 'worker',
    name: 'The Worker',
    statModifiers: { strength: 10 },
    saveModifiers: { body: 5, mind: 5, spirit: 5 },
    fixedSkills: ['Tinkering'],
    skillChoices: [{ options: ['Alchemy', 'Boating'] }],
    startingSkillPoints: 10,
    // TODO: SPEC.md §2 defers Worker trait names/text to the 0e rules; fill in from the rulebook.
    traits: [],
    eligibleRucksacks: ['Excavation', 'Exertion', 'Exploration'],
  },
  philosopher: {
    id: 'philosopher',
    name: 'The Philosopher',
    statModifiers: { intellect: 10 },
    saveModifiers: { mind: 5 },
    fixedSkills: ['Literacy'],
    skillChoices: [{ options: ['Basic Care', 'Alchemy'] }, { options: ['Knowledge', 'Perception'] }],
    startingSkillPoints: 7,
    traits: [{ name: 'Rational' }, { name: 'Loss of Reason' }],
    eligibleRucksacks: ['Examination', 'Experimentation', 'Exploration'],
  },
  stranger: {
    id: 'stranger',
    name: 'The Stranger',
    statModifiers: { intellect: 5, will: 5 },
    saveModifiers: { mind: 40, body: -10, spirit: -10 },
    fixedSkills: ['Foglore', 'Fog Vision'],
    skillChoices: [],
    startingSkillPoints: 5,
    traits: [
      {
        name: 'Odd Presence',
        description:
          "Non-Stranger party members lose 2 Hope when touching or waking up in the Stranger's presence.",
      },
    ],
    eligibleRucksacks: ['Extraction', 'Excommunication', 'Exploration'],
  },
  hunter: {
    id: 'hunter',
    name: 'The Hunter',
    statModifiers: { will: 10 },
    saveModifiers: { body: 5, spirit: 10 },
    fixedSkills: [],
    skillChoices: [{ options: ['Archery', 'Firearms'] }, { options: ['Hiding', 'Animals'] }],
    startingSkillPoints: 5,
    traits: [{ name: 'Thrill of the Hunt' }, { name: 'Falling Prey' }],
    eligibleRucksacks: ['Extermination', 'Exhibition', 'Exploration'],
  },
}

export const CLASS_IDS: readonly ClassId[] = ['worker', 'philosopher', 'stranger', 'hunter']

export function getClass(classId: ClassId): ClassDefinition {
  return CLASSES[classId]
}
