import { useState } from 'react'
import Box from '@mui/material/Box'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { AttributeRollStep } from './components/AttributeRollStep'
import { AttributeSummary } from './components/AttributeSummary'
import { SAVE_LABELS, STAT_LABELS } from './components/labels'
import {
  type AttributeDraft,
  EMPTY_SAVES_DRAFT,
  EMPTY_STATS_DRAFT,
  SAVE_DICE,
  SAVE_KEYS,
  STAT_DICE,
  STAT_KEYS,
  completeDraft,
  createCharacterFromBase,
  rollBaseSaves,
  rollBaseStats,
} from './domain/creation'
import type { Character, SaveKey, StatKey } from './domain/types'
import { APP_MAX_WIDTH_PX } from './theme'

const STEPS = ['Stats', 'Saves'] as const

export default function App() {
  const [activeStep, setActiveStep] = useState(0)
  const [stats, setStats] = useState<AttributeDraft<StatKey>>(EMPTY_STATS_DRAFT)
  const [saves, setSaves] = useState<AttributeDraft<SaveKey>>(EMPTY_SAVES_DRAFT)
  const [character, setCharacter] = useState<Character | null>(null)

  const confirmSaves = () => {
    const baseStats = completeDraft(stats, STAT_KEYS)
    const baseSaves = completeDraft(saves, SAVE_KEYS)
    if (!baseStats || !baseSaves) return
    setCharacter(createCharacterFromBase({ id: crypto.randomUUID() }, baseStats, baseSaves))
    setActiveStep(STEPS.length)
  }

  return (
    <Box
      component="main"
      sx={{ maxWidth: APP_MAX_WIDTH_PX, mx: 'auto', px: 2, py: 3, minHeight: '100dvh' }}
    >
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Fatherfog 0e
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <AttributeRollStep
          key="stats"
          title="Roll 6d10 for each Stat"
          keys={STAT_KEYS}
          labels={STAT_LABELS}
          dice={STAT_DICE}
          values={stats}
          onChange={setStats}
          onRoll={() => setStats(rollBaseStats())}
          onConfirm={() => setActiveStep(1)}
        />
      )}

      {activeStep === 1 && (
        <AttributeRollStep
          key="saves"
          title="Roll 5d10 for each Save"
          keys={SAVE_KEYS}
          labels={SAVE_LABELS}
          dice={SAVE_DICE}
          values={saves}
          onChange={setSaves}
          onRoll={() => setSaves(rollBaseSaves())}
          onConfirm={confirmSaves}
          onBack={() => setActiveStep(0)}
        />
      )}

      {activeStep === STEPS.length && character && (
        <AttributeSummary character={character} onBack={() => setActiveStep(1)} />
      )}
    </Box>
  )
}
