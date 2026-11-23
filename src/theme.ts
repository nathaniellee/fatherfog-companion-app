import { createTheme } from '@mui/material/styles'

/** Minimum touch target per project guidelines (44x44px). */
export const MIN_TOUCH_TARGET_PX = 44

export const theme = createTheme({
  palette: { mode: 'dark' },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: { minHeight: MIN_TOUCH_TARGET_PX, minWidth: MIN_TOUCH_TARGET_PX },
      },
    },
  },
})
