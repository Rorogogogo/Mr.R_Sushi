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
  getCartTotal,
  getAllCartItemsFromStorage,
} from '../services/cartService'
import CheckoutConfirmationDialog from './CheckoutConfirmationDialog'
import React from 'react'
import { appEvents } from '../utils/appEvents'

interface AddOnForCart {
  name: string
  price: number // Assuming price is a number here for calculations
}

type CartItem = {
  id: number
  menuItemId: number
  quantity: number
  menuItem: {
    id: number
    name: string
    price: string // Keep as string to match existing structure
    image?: string
    category?: string
  }
  companions?: string[]
  addOns?: AddOnForCart[] // Added for 煎饼 add-ons
}

type CartProps = {
  isOpen: boolean
  onClose: () => void
}

// Styled components
const CartHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  padding: theme.spacing(3),
  color: theme.palette.common.white,
  textAlign: 'center',
  position: 'relative',
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
}))

const CartFooter = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  padding: theme.spacing(3),
  borderTop: `1px solid ${theme.palette.divider}`,
  borderRadius: 0,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[6],
  zIndex: 1,
}))

const ItemImage = styled(Avatar)(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[1],
  marginRight: theme.spacing(2),
}))

const PriceText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}))

const EmptyCartContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8),
  textAlign: 'center',
  height: '100%',
  backgroundColor: theme.palette.background.default,
}))

const QuantityButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  border: `1px solid ${theme.palette.primary.light}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  boxShadow: theme.shadows[1],
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
  fontWeight: 600,
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}))

const CartItemCard = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}))

const ItemNameText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.05rem',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}))

const CheckoutButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.2, 3),
  fontWeight: 'bold',
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)',
  },
}))

const ClearButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.2, 3),
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
  },
}))

const Cart = ({ isOpen, onClose }: CartProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [bounce, setBounce] = useState(false)

  // Add this for checkout dialog
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false)

  // Calculate total items in cart
  const totalItems = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])

  // Calculate total price
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    // Calculate total price whenever cartItems change
    setTotalPrice(getCartTotal()) // getCartTotal from cartService reads from sessionStorage
  }, [cartItems]) // And also when isOpen changes if cart might be synced from server

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

  const handleQuantityChange = async (
    cartEntryId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return

    const itemInCart = cartItems.find((item) => item.id === cartEntryId)
    if (!itemInCart) return

    const originalQuantity = itemInCart.quantity

    // Optimistic UI update
    setCartItems(
      cartItems.map((item) =>
        item.id === cartEntryId ? { ...item, quantity: newQuantity } : item
      )
    )

    try {
      await updateCartItemQuantity(cartEntryId, newQuantity)
      appEvents.emit('cartItemQuantityChanged', {
        menuItemId: itemInCart.menuItemId,
        newQuantity,
        cartItemId: cartEntryId,
      })
      appEvents.emit('cartUpdated') // For FloatingCart
    } catch (err) {
      setError('更新数量失败')
      console.error(err)
      // Revert optimistic update
      setCartItems(
        cartItems.map((item) =>
          item.id === cartEntryId
            ? { ...item, quantity: originalQuantity }
            : item
        )
      )
      appEvents.emit('cartUpdated') // Refresh FloatingCart to actual state
    }
  }

  const handleRemoveItem = async (id: number) => {
    try {
      await removeCartItem(id) // This updates sessionStorage via cartService
      // Directly update cartItems state from sessionStorage for immediate UI feedback
      const updatedLocalItems = getAllCartItemsFromStorage()
      setCartItems(updatedLocalItems)
      appEvents.emit('cartUpdated')
      // Total price will be recalculated by the useEffect watching cartItems
    } catch (err) {
      setError('移除商品失败')
      console.error(err)
      appEvents.emit('cartUpdated')
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      setCartItems([])
      appEvents.emit('cartUpdated')
    } catch (err) {
      setError('清空购物车失败')
      console.error(err)
      appEvents.emit('cartUpdated')
    }
  }

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) {
      setError('购物车为空')
      return
    }
    setCheckoutDialogOpen(true)
  }

  const handleCheckoutSuccess = (orderNumber: string) => {
    // Clear the cart and show success message
    setOrderSuccess(true)
    setCartItems([])
    appEvents.emit('cartUpdated')

    // Close the checkout dialog and cart after a delay
    setTimeout(() => {
      setOrderSuccess(false)
      onClose()
    }, 2000)
  }

  const fallbackImageUrl =
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop'

  return (
    <>
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
            backgroundColor: theme.palette.background.default,
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
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }}
            size="small">
            <CloseIcon />
          </IconButton>

          <Box sx={{ pt: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              预定
              <motion.span
                style={{ display: 'inline-block', marginLeft: 8 }}
                animate={bounce ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 0.3 }}>
                🍣
              </motion.span>
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
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
                  py: 2,
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
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ borderRadius: 0 }}>
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
              backgroundColor: theme.palette.background.default,
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
                      opacity: 0.7,
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
                  size="large"
                  sx={{
                    borderRadius: 4,
                    px: 3,
                    py: 1,
                    boxShadow: theme.shadows[3],
                  }}>
                  查看菜单
                </Button>
              </EmptyCartContainer>
            ) : (
              <>
                {/* Cart Items */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2, px: 2 }}>
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
                          <CartItemCard
                            secondaryAction={
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveItem(item.id)}
                                color="error"
                                sx={{
                                  backgroundColor: 'rgba(211,47,47,0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(211,47,47,0.2)',
                                  },
                                }}>
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
                                <ItemNameText>
                                  {item.menuItem.name}
                                </ItemNameText>
                              }
                              secondary={
                                <Stack spacing={2} sx={{ mt: 1 }}>
                                  {/* Display companions for pancake items */}
                                  {item.companions &&
                                    item.companions.length > 0 && (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          flexWrap: 'wrap',
                                          mt: 0.5,
                                          gap: 0.5,
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

                                  {/* Display AddOns */}
                                  {item.addOns && item.addOns.length > 0 && (
                                    <Box sx={{ mt: 0.5, mb: 1 }}>
                                      {item.addOns.map((addOn) => (
                                        <Chip
                                          key={addOn.name}
                                          label={`${
                                            addOn.name
                                          } (+${addOn.price.toFixed(2)}元)`}
                                          size="small"
                                          variant="outlined"
                                          sx={{
                                            mr: 0.5,
                                            mb: 0.5,
                                            fontSize: '0.7rem',
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  )}

                                  {/* Price display for individual item */}
                                  <PriceText
                                    variant="body2"
                                    sx={{ fontSize: '1.1rem', mt: 1 }}>
                                    {(() => {
                                      let individualItemTotal = parseFloat(
                                        item.menuItem.price.replace('元', '')
                                      )
                                      if (isNaN(individualItemTotal))
                                        individualItemTotal = 0

                                      // Add companion prices (existing logic)
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
                                            individualItemTotal +=
                                              companionPrices[
                                                companion as keyof typeof companionPrices
                                              ]
                                          }
                                        })
                                      }

                                      // Add addOns prices
                                      if (
                                        item.addOns &&
                                        item.addOns.length > 0
                                      ) {
                                        item.addOns.forEach((addOn) => {
                                          individualItemTotal += addOn.price
                                        })
                                      }

                                      // Display logic: if only base price, show that. If addOns/companions, show breakdown or just total.
                                      // For simplicity, just showing the final calculated price per item quantity.
                                      return `${(
                                        individualItemTotal * item.quantity
                                      ).toFixed(2)}元`
                                    })()}
                                  </PriceText>

                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mt: 1.5,
                                    }}>
                                    <ButtonGroup
                                      variant="outlined"
                                      size="small"
                                      sx={{
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                      }}>
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
                                        size="small"
                                        sx={{
                                          backgroundColor:
                                            theme.palette.primary.main,
                                          color:
                                            theme.palette.primary.contrastText,
                                          '&:hover': {
                                            backgroundColor:
                                              theme.palette.primary.dark,
                                          },
                                        }}>
                                        <AddIcon fontSize="small" />
                                      </QuantityButton>
                                    </ButtonGroup>
                                  </Box>
                                </Stack>
                              }
                              secondaryTypographyProps={{ component: 'div' }}
                              sx={{ ml: 1 }}
                            />
                          </CartItemCard>
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
                        alignItems: 'center',
                        mb: 3,
                      }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        总计:
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: 700,
                        }}>
                        {totalPrice.toFixed(2)} 元
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <ClearButton
                        variant="outlined"
                        color="inherit"
                        onClick={handleClearCart}
                        startIcon={<DeleteIcon />}
                        fullWidth>
                        清空预定
                      </ClearButton>
                      <CheckoutButton
                        variant="contained"
                        onClick={handleOpenCheckout}
                        fullWidth>
                        确认预定
                      </CheckoutButton>
                    </Stack>
                  </CartFooter>
                )}
              </>
            )}
          </>
        )}
      </Drawer>

      {/* Checkout Confirmation Dialog */}
      <CheckoutConfirmationDialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        totalAmount={totalPrice}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  )
}

export default Cart
