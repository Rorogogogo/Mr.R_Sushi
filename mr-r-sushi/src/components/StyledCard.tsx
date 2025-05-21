import { styled } from '@mui/material/styles'
import { Card, CardMedia, Box } from '@mui/material'

// Styled components
export const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Make card take full height of its grid item
  minHeight: 420, // Minimum height for consistency, adjust as needed
  maxHeight: 420, // Maximum height for consistency, adjust as needed
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: theme.shadows[6],
  },
  // Ensure CardContent inside grows and CardActions stay at bottom
  '& .MuiCardContent-root': {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Pushes description and bottom elements apart
  },
  '& .MuiCardActions-root': {
    flexShrink: 0, // Prevent actions from shrinking
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  // Set strict fixed width for mobile to ensure all cards are identical
  [theme.breakpoints.down('sm')]: {
    width: '320px !important', // Fixed width instead of percentage
    maxWidth: '320px !important',
    minWidth: '320px !important',
    marginLeft: 'auto !important',
    marginRight: 'auto !important',
    flexShrink: 0,
    flexGrow: 0,
  },
  // Ensure all content is properly constrained
  '& .MuiTypography-h6': {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& .MuiTypography-body2': {
    width: '100%',
    overflow: 'hidden',
  },
}))

export const CardImageContainer = styled(Box)({
  height: 200, // Fixed height for the image container
  position: 'relative',
  overflow: 'hidden',
})

export const StyledCardMedia = styled(CardMedia)({
  height: '100%',
  width: '100%',
  objectFit: 'cover',
})

export default {
  StyledCard,
  CardImageContainer,
  StyledCardMedia,
}
