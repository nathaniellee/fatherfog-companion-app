import { createTheme } from '@mui/material/styles'

/** Minimum tap target for every interactive control (48×48px). */
export const MIN_TOUCH_TARGET_PX = 48

/** Mobile-first column width for the creation wizard. */
export const APP_MAX_WIDTH_PX = 430

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#c9d4c5', contrastText: '#14181a' },
    secondary: { main: '#8fa3ad' },
    background: { default: '#14181a', paper: '#1d2326' },
    text: { primary: '#e6ebe4', secondary: '#9aa6a0' },
    divider: 'rgba(201, 212, 197, 0.16)',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    button: { fontWeight: 700, letterSpacing: '0.08em' },
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: { minHeight: MIN_TOUCH_TARGET_PX, minWidth: MIN_TOUCH_TARGET_PX },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: MIN_TOUCH_TARGET_PX, paddingInline: 20 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { width: MIN_TOUCH_TARGET_PX, height: MIN_TOUCH_TARGET_PX },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { minHeight: MIN_TOUCH_TARGET_PX },
      },
    },
  },
})
