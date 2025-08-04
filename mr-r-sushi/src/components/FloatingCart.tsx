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
  backgroundColor: '#1A1A1A',
  color: '#F8F8F6',
  boxShadow: '0 8px 32px rgba(10, 10, 10, 0.3)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(248, 248, 246, 0.1)',
  '&:hover': {
    backgroundColor: '#2A2A2A',
    boxShadow: '0 12px 40px rgba(10, 10, 10, 0.4)',
    transform: 'translateY(-3px) scale(1.05)',
  },
  transition: 'all 0.3s ease',
  width: 64,
  height: 64,
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

  // Show on all devices now
  // if (!isMobile) return null

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
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#C9A961',
                color: '#0A0A0A',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                minWidth: '20px',
                height: '20px',
                borderRadius: '10px',
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
