import type { SaveKey, StatKey } from '../domain/types'

export const STAT_LABELS: Readonly<Record<StatKey, string>> = {
  strength: 'Strength',
  intellect: 'Intellect',
  will: 'Will',
}

export const SAVE_LABELS: Readonly<Record<SaveKey, string>> = {
  body: 'Body',
  mind: 'Mind',
  spirit: 'Spirit',
}
