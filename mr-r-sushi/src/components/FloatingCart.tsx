import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCartItems } from '../services/cartService'
import {
  Fab,
  Badge,
  styled,
  useTheme,
  Zoom,
  useMediaQuery,
} from '@mui/material'
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material'
import { appEvents } from '../utils/appEvents'

// Placeholder for appEvents if not implemented, replace with actual import
// const appEvents = {
//   on: (event: string, callback: () => void) => {
//     console.warn(
//       'appEvents.on called for',
//       event,
//       'but emitter might not be fully implemented.'
//     )
//   },
//   off: (event: string, callback: () => void) => {
//     console.warn(
//       'appEvents.off called for',
//       event,
//       'but emitter might not be fully implemented.'
//     )
//   },
//   // emit is not needed in this component
// }

type FloatingCartProps = {
  onClick: () => void
}

// Styled components
const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 30,
  boxShadow: theme.shadows[4],
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-3px)',
  },
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
}))

// Animation variants for framer-motion
const MotionBadge = styled(motion.div)({
  display: 'inline-flex',
})

const FloatingCart: React.FC<FloatingCartProps> = ({ onClick }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [cartItemCount, setCartItemCount] = useState(0)
  const [bounce, setBounce] = useState(false)

  // Fetch cart items count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const items = await getCartItems()
        const newCount = items.reduce(
          (total: number, item: any) => total + item.quantity,
          0
        )

        setCartItemCount((prevCount) => {
          if (newCount > prevCount) {
            setBounce(true)
            setTimeout(() => setBounce(false), 300) // Bounce animation
          }
          return newCount
        })
      } catch (err) {
        console.error('Error fetching cart count:', err)
      }
    }

    fetchCartCount() // Initial fetch

    // Subscribe to cart update events
    appEvents.on('cartUpdated', fetchCartCount)

    // Cleanup subscription on component unmount
    return () => {
      appEvents.off('cartUpdated', fetchCartCount)
    }
  }, []) // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Only show on mobile
  if (!isMobile) return null

  return (
    <Zoom in={true} style={{ transitionDelay: '500ms' }}>
      <StyledFab
        color="primary"
        aria-label="shopping cart"
        onClick={onClick}
        size="large">
        <MotionBadge
          animate={bounce ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}>
          <Badge
            badgeContent={cartItemCount}
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontWeight: 'bold',
                fontSize: '0.75rem',
              },
            }}>
            <ShoppingCartIcon />
          </Badge>
        </MotionBadge>
      </StyledFab>
    </Zoom>
  )
}

export default FloatingCart
