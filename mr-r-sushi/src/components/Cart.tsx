import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  Badge,
  ButtonGroup,
  Stack,
  Zoom,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material'
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  checkoutCart,
} from '../services/cartService'

type CartItem = {
  id: number
  menuItemId: number
  quantity: number
  menuItem: {
    id: number
    name: string
    price: string
    image?: string
    category?: string
  }
  companions?: string[]
}

type CartProps = {
  isOpen: boolean
  onClose: () => void
}

// Styled components
const CartHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  padding: theme.spacing(2),
  color: theme.palette.common.white,
  textAlign: 'center',
  position: 'relative',
}))

const CartFooter = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  borderRadius: 0,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  zIndex: 1,
}))

const ItemImage = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
}))

const PriceText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
}))

const EmptyCartContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8),
  textAlign: 'center',
  height: '100%',
}))

const QuantityButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  border: `1px solid ${theme.palette.primary.light}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}))

const QuantityText = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '36px',
  fontWeight: 600,
}))

// Create a new styled component for companion chips
const CompanionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5, 0.5, 0.5, 0),
  backgroundColor: 'rgba(255, 152, 0, 0.1)',
  border: `1px solid ${theme.palette.warning.light}`,
  fontSize: '0.7rem',
}))

const Cart = ({ isOpen, onClose }: CartProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [bounce, setBounce] = useState(false)

  // Calculate total items in cart
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Calculate total price including companions
  const totalPrice = cartItems.reduce((total, item) => {
    // Base price
    let price = parseFloat(item.menuItem.price.replace('元', ''))

    // Add companion prices if any
    if (item.companions && item.companions.length > 0) {
      const companionPrices: Record<string, number> = {
        加海苔: 3,
        加肉松: 4,
        加火腿肉: 6,
        加培根: 7,
      }

      item.companions.forEach((companion) => {
        if (companion in companionPrices) {
          price += companionPrices[companion]
        }
      })
    }

    return total + price * item.quantity
  }, 0)

  // Fetch cart items
  useEffect(() => {
    if (isOpen) {
      fetchCartItems()
    }
  }, [isOpen])

  // Add bounce effect when items change
  useEffect(() => {
    if (cartItems.length > 0) {
      setBounce(true)
      const timer = setTimeout(() => setBounce(false), 300)
      return () => clearTimeout(timer)
    }
  }, [cartItems.length])

  const fetchCartItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const items = await getCartItems()
      setCartItems(items)
    } catch (err) {
      setError('获取购物车失败')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      await updateCartItemQuantity(id, newQuantity)
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (err) {
      setError('更新数量失败')
      console.error(err)
    }
  }

  const handleRemoveItem = async (id: number) => {
    try {
      await removeCartItem(id)
      setCartItems(cartItems.filter((item) => item.id !== id))
    } catch (err) {
      setError('移除商品失败')
      console.error(err)
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      setCartItems([])
    } catch (err) {
      setError('清空购物车失败')
      console.error(err)
    }
  }

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      await checkoutCart()
      setOrderSuccess(true)
      setTimeout(() => {
        setOrderSuccess(false)
        setCartItems([])
        onClose()
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : '结账失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const fallbackImageUrl =
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop'

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          maxWidth: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}>
      {/* Cart Header */}
      <CartHeader>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            left: 8,
            top: 8,
            color: 'white',
          }}
          size="small">
          <CloseIcon />
        </IconButton>

        <Box sx={{ pt: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            预定
            <motion.span
              style={{ display: 'inline-block', marginLeft: 8 }}
              animate={bounce ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 0.3 }}>
              🍣
            </motion.span>
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            您有 {totalItems} 件预定商品
          </Typography>
        </Box>
      </CartHeader>

      {/* Success Message */}
      <AnimatePresence>
        {orderSuccess && (
          <Fade in timeout={500}>
            <Alert
              severity="success"
              sx={{
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              icon={<CheckCircleIcon fontSize="inherit" />}>
              <AlertTitle>订单成功!</AlertTitle>
              谢谢您的惠顾 🎉
            </Alert>
          </Fade>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <Fade in timeout={500}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Fade>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            flexDirection: 'column',
            gap: 2,
          }}>
          <CircularProgress color="primary" size={60} thickness={4} />
          <Typography color="text.secondary">加载中...</Typography>
        </Box>
      ) : (
        <>
          {/* Empty Cart */}
          {cartItems.length === 0 && !orderSuccess ? (
            <EmptyCartContainer>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}>
                <ShoppingCartIcon
                  sx={{
                    fontSize: 80,
                    color: 'text.disabled',
                    mb: 2,
                  }}
                />
              </motion.div>
              <Typography variant="h6" color="text.primary" gutterBottom>
                您还没有预定商品
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 3 }}>
                去发现美味的寿司吧!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RestaurantMenuIcon />}
                onClick={onClose}
                size="large">
                查看菜单
              </Button>
            </EmptyCartContainer>
          ) : (
            <>
              {/* Cart Items */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
                <List disablePadding>
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          x: 100,
                          height: 0,
                          marginBottom: 0,
                          overflow: 'hidden',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}>
                        <ListItem
                          sx={{
                            py: 2,
                            px: 2,
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '3px',
                              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            },
                          }}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveItem(item.id)}
                              color="error">
                              <DeleteIcon />
                            </IconButton>
                          }>
                          <ListItemAvatar>
                            <ItemImage
                              src={item.menuItem.image || fallbackImageUrl}
                              alt={item.menuItem.name}
                              variant="rounded"
                              imgProps={{
                                onError: (
                                  e: React.SyntheticEvent<HTMLImageElement>
                                ) => {
                                  e.currentTarget.src = fallbackImageUrl
                                },
                              }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight="bold">
                                {item.menuItem.name}
                              </Typography>
                            }
                            secondary={
                              <Stack spacing={1} sx={{ mt: 1 }}>
                                {/* Display companions for pancake items */}
                                {item.companions &&
                                  item.companions.length > 0 && (
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        mt: 0.5,
                                      }}>
                                      {item.companions.map(
                                        (companion, index) => (
                                          <CompanionChip
                                            key={index}
                                            label={companion}
                                            size="small"
                                          />
                                        )
                                      )}
                                    </Box>
                                  )}

                                {/* Price display with companion prices included */}
                                <PriceText variant="body2">
                                  {(() => {
                                    let basePrice = parseFloat(
                                      item.menuItem.price.replace('元', '')
                                    )
                                    let companionPrice = 0

                                    // Calculate companion prices
                                    if (
                                      item.companions &&
                                      item.companions.length > 0
                                    ) {
                                      const companionPrices: Record<
                                        string,
                                        number
                                      > = {
                                        加海苔: 3,
                                        加肉松: 4,
                                        加火腿肉: 6,
                                        加培根: 7,
                                      }

                                      item.companions.forEach((companion) => {
                                        if (companion in companionPrices) {
                                          companionPrice +=
                                            companionPrices[companion]
                                        }
                                      })
                                    }

                                    // Format the price display
                                    if (companionPrice > 0) {
                                      return `${basePrice}元 + ${companionPrice}元 = ${
                                        basePrice + companionPrice
                                      }元`
                                    }
                                    return item.menuItem.price
                                  })()}
                                </PriceText>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mt: 1,
                                  }}>
                                  <ButtonGroup variant="outlined" size="small">
                                    <QuantityButton
                                      aria-label="decrease quantity"
                                      onClick={() =>
                                        handleQuantityChange(
                                          item.id,
                                          item.quantity - 1
                                        )
                                      }
                                      disabled={item.quantity <= 1}
                                      size="small">
                                      <RemoveIcon fontSize="small" />
                                    </QuantityButton>
                                    <QuantityText variant="body2">
                                      {item.quantity}
                                    </QuantityText>
                                    <QuantityButton
                                      aria-label="increase quantity"
                                      onClick={() =>
                                        handleQuantityChange(
                                          item.id,
                                          item.quantity + 1
                                        )
                                      }
                                      size="small">
                                      <AddIcon fontSize="small" />
                                    </QuantityButton>
                                  </ButtonGroup>
                                </Box>
                              </Stack>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </List>
              </Box>

              {/* Cart Footer - Only shown when items exist */}
              {cartItems.length > 0 && (
                <CartFooter elevation={3}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}>
                    <Typography variant="subtitle1">小计:</Typography>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      fontWeight="bold">
                      {totalPrice.toFixed(2)} 元
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleClearCart}
                      startIcon={<DeleteIcon />}
                      fullWidth>
                      清空预定
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCheckout}
                      fullWidth>
                      结账
                    </Button>
                  </Stack>
                </CartFooter>
              )}
            </>
          )}
        </>
      )}
    </Drawer>
  )
}

export default Cart
