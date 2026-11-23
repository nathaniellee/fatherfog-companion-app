import { useState } from 'react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type AttributeDraft, completeDraft, parseAttributeEntry } from '../domain/creation'
import { diceRange, formatDice } from '../domain/dice'
import type { DiceExpression } from '../domain/types'
import { AttributeBadge } from './AttributeBadge'

interface AttributeRollStepProps<K extends string> {
  title: string
  keys: readonly K[]
  labels: Readonly<Record<K, string>>
  dice: DiceExpression
  values: AttributeDraft<K>
  onChange: (values: AttributeDraft<K>) => void
  /** Rolls every attribute via the domain dice helpers. */
  onRoll: () => void
  onConfirm: () => void
  onBack?: () => void
}

const toText = (value: number | null) => (value === null ? '' : String(value))

/** One wizard step: roll (or hand-enter) a set of three attributes, then confirm. */
export function AttributeRollStep<K extends string>({
  title,
  keys,
  labels,
  dice,
  values,
  onChange,
  onRoll,
  onConfirm,
  onBack,
}: AttributeRollStepProps<K>) {
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState<Partial<Record<K, string>>>({})
  const { min, max } = diceRange(dice)
  const complete = completeDraft(values, keys) !== null

  const startEditing = () => {
    setDraftText(Object.fromEntries(keys.map((k) => [k, toText(values[k])])) as Record<K, string>)
    setEditing(true)
  }

  const handleText = (key: K, text: string) => {
    setDraftText((prev) => ({ ...prev, [key]: text }))
    onChange({ ...values, [key]: parseAttributeEntry(text, dice) })
  }

  const handleRoll = () => {
    setEditing(false)
    onRoll()
  }

  const isInvalid = (key: K) => {
    const text = draftText[key] ?? ''
    return editing && text.trim() !== '' && parseAttributeEntry(text, dice) === null
  }
  const anyInvalid = keys.some(isInvalid)

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roll {formatDice(dice)} for each, or tap Edit to enter your own dice ({min}–{max}).
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          {keys.map((key) => (
            <AttributeBadge
              key={key}
              label={labels[key]}
              value={values[key]}
              editing={editing}
              draftText={draftText[key] ?? ''}
              invalid={isInvalid(key)}
              min={min}
              max={max}
              onDraftTextChange={(text) => handleText(key, text)}
            />
          ))}
        </Stack>

        <Typography
          variant="caption"
          color="error"
          role="status"
          sx={{ textAlign: 'center', minHeight: 20, mt: '8px !important' }}
        >
          {anyInvalid ? `Enter a whole number from ${min} to ${max}.` : ''}
        </Typography>

        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" size="large" fullWidth onClick={handleRoll}>
            Roll
          </Button>
          <Button
            variant={editing ? 'contained' : 'outlined'}
            color="secondary"
            size="large"
            aria-pressed={editing}
            onClick={editing ? () => setEditing(false) : startEditing}
            sx={{ flexShrink: 0, minWidth: 104 }}
          >
            {editing ? 'Done' : 'Edit'}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
          {onBack && (
            <Button size="large" onClick={onBack} sx={{ flexShrink: 0 }}>
              Back
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!complete}
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
