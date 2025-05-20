import { createTheme } from '@mui/material/styles'

// Create a custom theme with Japanese restaurant-inspired colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF9800', // Orange color for main primary
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#16213E', // Deep blue, representing sea and traditional Japanese colors
      light: '#2A3B5F',
      dark: '#0A1126',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4ECCA3', // Wasabi green
      light: '#6EDEB7',
      dark: '#36B389',
    },
    info: {
      main: '#53B8BB', // Teal color representing water/ocean
      light: '#78CBCD',
      dark: '#3D9A9D',
    },
    warning: {
      main: '#FFA726', // Deeper orange for warnings
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#D61C4E', // Bright red
      light: '#E14A73',
      dark: '#B6002F',
    },
    background: {
      default: '#F7F7F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#16213E',
      secondary: '#535A6A',
      disabled: '#A0A0A0',
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans"',
      '"Noto Sans JP"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(233, 69, 96, 0.3)',
          },
        },
        containedSecondary: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(22, 33, 62, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
      },
    },
  },
})

export default theme
