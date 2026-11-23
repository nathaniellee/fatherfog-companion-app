import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'

const BADGE_SIZE_PX = 88

interface AttributeBadgeProps {
  label: string
  value: number | null
  editing: boolean
  /** Raw text while editing (may be partial or invalid). */
  draftText: string
  invalid: boolean
  min: number
  max: number
  onDraftTextChange: (text: string) => void
}

/** Circular stat/save badge; shows `—` until a value exists, or a numeric input in edit mode. */
export function AttributeBadge({
  label,
  value,
  editing,
  draftText,
  invalid,
  min,
  max,
  onDraftTextChange,
}: AttributeBadgeProps) {
  const ringColor = invalid ? 'error.main' : value === null ? 'divider' : 'primary.main'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
      <Box
        sx={{
          width: BADGE_SIZE_PX,
          height: BADGE_SIZE_PX,
          borderRadius: '50%',
          border: 3,
          borderColor: ringColor,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 150ms',
        }}
      >
        {editing ? (
          <InputBase
            value={draftText}
            onChange={(e) => onDraftTextChange(e.target.value)}
            placeholder="—"
            error={invalid}
            slotProps={{
              input: {
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 2,
                'aria-label': `${label} (${min}–${max})`,
                'aria-invalid': invalid,
                style: { textAlign: 'center' },
              },
            }}
            sx={{ width: 64, fontSize: 32, fontWeight: 700, '& input': { p: 0 } }}
          />
        ) : (
          <Typography
            component="span"
            aria-label={`${label}: ${value ?? 'not rolled'}`}
            sx={{ fontSize: 32, fontWeight: 700, color: value === null ? 'text.secondary' : 'text.primary' }}
          >
            {value ?? '—'}
          </Typography>
        )}
      </Box>
      <Typography
        variant="overline"
        sx={{ lineHeight: 1.2, fontWeight: 700, color: invalid ? 'error.main' : 'text.secondary' }}
      >
        {label}
      </Typography>
    </Box>
  )
}
