import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SAVE_KEYS, STAT_KEYS } from '../domain/creation'
import type { Character } from '../domain/types'
import { SAVE_LABELS, STAT_LABELS } from './labels'

interface AttributeSummaryProps {
  character: Character
  onBack: () => void
}

/** Placeholder end-of-wizard card until the class step exists. */
export function AttributeSummary({ character, onBack }: AttributeSummaryProps) {
  const rows = [
    ...STAT_KEYS.map((k) => [STAT_LABELS[k], character.baseStats[k]] as const),
    ...SAVE_KEYS.map((k) => [SAVE_LABELS[k], character.baseSaves[k]] as const),
  ]
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          Base attributes recorded
        </Typography>
        <Stack component="dl" spacing={1} sx={{ m: 0 }}>
          {rows.map(([label, value]) => (
            <Stack key={label} direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography component="dt" color="text.secondary">
                {label}
              </Typography>
              <Typography component="dd" sx={{ m: 0, fontWeight: 700 }}>
                {value}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Class selection comes next.
        </Typography>
        <Button size="large" onClick={onBack} sx={{ alignSelf: 'flex-start' }}>
          Back
        </Button>
      </Stack>
    </Paper>
  )
}
