import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  styled,
  Divider,
  Badge,
} from '@mui/material'
import {
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  LocalFireDepartment as HotIcon,
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import type { MenuItem } from '../types/menu'
import { getAllMenuItems as fetchAllMenuItems } from '../services/menuService'
import {
  addToCart,
  updateCartItemQuantity,
  getAllCartItemsFromStorage,
  removeCartItem as removeCartItemService,
} from '../services/cartService'
import CompanionSelectionDialog from './CompanionSelectionDialog'
import { StyledCard, CardImageContainer, StyledCardMedia } from './StyledCard'
import { appEvents } from '../utils/appEvents'

// Define AddOnOption interface
interface AddOnOption {
  id?: string | number
  name: string
  price: number
}

interface CartItemQuantityChangedPayload {
  menuItemId: number
  newQuantity: number
  cartItemId: number
}

// Animation variants
const MotionContainer = styled(motion.div)({
  width: '100%',
})

const MotionItem = styled(motion.div)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    width: '320px',
    display: 'flex',
    justifyContent: 'center',
    margin: '0 auto',
  },
}))

// Styled components
const CategoryTab = styled(Tab)(({ theme }) => ({
  minWidth: 80,
  fontWeight: 600,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}))

const MenuCategory = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(6, 0, 8),
}))

const CategoryTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  display: 'inline-block',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -8,
    height: 3,
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.light})`,
    borderRadius: theme.shape.borderRadius,
  },
}))

const FeaturedBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
}))

const PriceChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  border: `1px solid ${theme.palette.primary.main}`,
}))

// Add ReserveButton styled component similar to CircularGallery
const ReserveButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.2),
  fontWeight: 'bold',
  textTransform: 'none',
  letterSpacing: 0.5,
  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
  '&:hover': {
    boxShadow: '0 8px 25px rgba(0,0,0,0.18)',
    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  },
}))

const QuantityControlContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
}))

const QuantityButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.light}`,
  padding: 8,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}))

const QuantityText = styled(Typography)(({ theme }) => ({
  minWidth: 36,
  textAlign: 'center',
  fontWeight: 'bold',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}))

// Add a styled component for category chips after the other styled components
const CategoryChip = styled(Chip)(({ theme }) => ({
  borderRadius: '16px',
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: theme.palette.primary.dark,
  '&.special': {
    backgroundColor: theme.palette.warning.main,
  },
  '&.handroll': {
    backgroundColor: theme.palette.primary.main,
  },
  '&.pancake': {
    backgroundColor: theme.palette.warning.main,
  },
}))

// Helper type guard for data with $values
function isDataWithValues(
  data: any
): data is { $id: string; $values: MenuItem[] } {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.$values) &&
    '$values' in data
  )
}

// Main Menu Component
const Menu = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'sushi' | 'handroll' | 'pancake'
  >('all')
  const [itemQuantities, setItemQuantities] = useState<
    Record<number, { cartItemId: number; quantity: number }>
  >({})
  const [isAddingToCart, setIsAddingToCart] = useState<Record<number, boolean>>(
    {}
  )
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  )
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false)

  // Fallback image for when an image fails to load
  const fallbackImageUrl = '/images/product_img/1.png'

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImageUrl
  }

  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true)
      try {
        const response = await fetchAllMenuItems()
        // Handle the new response format with ReferenceHandler.Preserve
        if (isDataWithValues(response.data)) {
          setMenuItems(response.data.$values)
        } else if (Array.isArray(response.data)) {
          setMenuItems(response.data)
        } else {
          // Fallback or error handling if data is not in expected format
          console.error('Unexpected menu data format:', response.data)
          setMenuItems([])
        }
      } catch (error) {
        console.error('Error loading menu data:', error)
        toast.error('无法加载菜单数据，请稍后重试')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  // New useEffect to initialize itemQuantities from cartService
  useEffect(() => {
    if (menuItems.length > 0) {
      const persistedCartItems = getAllCartItemsFromStorage()
      const initialQuantities: Record<
        number,
        { cartItemId: number; quantity: number }
      > = {}
      persistedCartItems.forEach((cartItem) => {
        // Ensure the menu item exists before setting quantity
        const menuItemExists = menuItems.find(
          (mi) => mi.id === cartItem.menuItemId
        )
        if (menuItemExists) {
          initialQuantities[cartItem.menuItemId] = {
            cartItemId: cartItem.id, // Cart item's own ID
            quantity: cartItem.quantity,
          }
        }
      })
      setItemQuantities(initialQuantities)
    }
  }, [menuItems]) // Run when menuItems are populated

  // Effect to listen for external cart item quantity changes
  useEffect(() => {
    const handleExternalQuantityChange = (
      data: CartItemQuantityChangedPayload
    ) => {
      if (data && typeof data.menuItemId === 'number') {
        setItemQuantities((prevQuantities) => {
          const newQuantities = { ...prevQuantities }
          if (data.newQuantity > 0) {
            newQuantities[data.menuItemId] = {
              cartItemId: data.cartItemId,
              quantity: data.newQuantity,
            }
          } else {
            delete newQuantities[data.menuItemId]
          }
          return newQuantities
        })
      }
    }

    appEvents.on('cartItemQuantityChanged', handleExternalQuantityChange)
    return () => {
      appEvents.off('cartItemQuantityChanged', handleExternalQuantityChange)
    }
  }, []) // Runs once on mount

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  // Modify handleAddToCart to update quantities
  const handleAddToCart = async (menuItem: MenuItem) => {
    if (menuItem.category === 'pancake' && menuItem.name.includes('煎饼')) {
      setSelectedMenuItem(menuItem)
      setCompanionDialogOpen(true)
      return
    }

    setIsAddingToCart((prev) => ({ ...prev, [menuItem.id]: true }))
    const existingQuantityInfo = itemQuantities[menuItem.id]
    const currentQuantity = existingQuantityInfo?.quantity || 0
    const newQuantity = currentQuantity + 1
    let cartItemId = existingQuantityInfo?.cartItemId

    // Optimistic UI update
    setItemQuantities((prev) => ({
      ...prev,
      [menuItem.id]: {
        cartItemId: cartItemId || menuItem.id, // Use existing or temp ID (menuItem.id for new)
        quantity: newQuantity,
      },
    }))

    try {
      if (cartItemId && currentQuantity > 0) {
        // Item exists in cart, update it
        await updateCartItemQuantity(cartItemId, newQuantity)
      } else {
        // New item, add it
        const result = await addToCart(menuItem, 1)
        if (result && result.id) {
          cartItemId = result.id // Get the actual cartItemId from backend
          // Update local state with the correct cartItemId if it was a new add
          setItemQuantities((prev) => ({
            ...prev,
            [menuItem.id]: { ...prev[menuItem.id], cartItemId: cartItemId! },
          }))
        }
      }

      if (cartItemId) {
        // Ensure cartItemId is available before emitting
        appEvents.emit('cartItemQuantityChanged', {
          menuItemId: menuItem.id,
          newQuantity,
          cartItemId,
        })
      }
      appEvents.emit('cartUpdated')
      toast.success(`${menuItem.name} 已预定`, { duration: 2000, icon: '🍽️' })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('预定失败，请重试')
      // Revert optimistic update
      setItemQuantities((prev) => {
        const revertedQtys = { ...prev }
        if (currentQuantity === 0) {
          // Was a new add that failed
          delete revertedQtys[menuItem.id]
        } else if (cartItemId) {
          // Was an update that failed
          revertedQtys[menuItem.id] = {
            cartItemId: cartItemId!,
            quantity: currentQuantity,
          }
        }
        return revertedQtys
      })
      appEvents.emit('cartUpdated')
    } finally {
      setTimeout(
        () => setIsAddingToCart((prev) => ({ ...prev, [menuItem.id]: false })),
        300
      )
    }
  }

  // Add handleRemoveFromCart function
  const handleRemoveFromCart = async (menuItem: MenuItem) => {
    const existingQuantityInfo = itemQuantities[menuItem.id]
    if (!existingQuantityInfo || existingQuantityInfo.quantity <= 0) return

    const originalQuantity = existingQuantityInfo.quantity
    const cartItemId = existingQuantityInfo.cartItemId
    const newQuantity = originalQuantity - 1

    // Optimistic UI update
    setItemQuantities((prev) => {
      const newQtys = { ...prev }
      if (newQuantity === 0) {
        delete newQtys[menuItem.id]
      } else {
        newQtys[menuItem.id] = {
          ...newQtys[menuItem.id],
          quantity: newQuantity,
        }
      }
      return newQtys
    })

    try {
      if (newQuantity === 0) {
        await removeCartItemService(cartItemId)
      } else {
        await updateCartItemQuantity(cartItemId, newQuantity)
      }
      appEvents.emit('cartItemQuantityChanged', {
        menuItemId: menuItem.id,
        newQuantity,
        cartItemId,
      })
      appEvents.emit('cartUpdated')
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('更新失败，请重试')
      // Revert optimistic update
      setItemQuantities((prev) => ({
        ...prev,
        [menuItem.id]: { cartItemId, quantity: originalQuantity },
      }))
      appEvents.emit('cartUpdated')
    }
  }

  // Handle adding pancake with companions to cart
  const handleAddPancakeWithCompanions = async (
    addOnsReceived: AddOnOption[]
  ) => {
    if (!selectedMenuItem) return
    const menuItem = selectedMenuItem
    setIsAddingToCart((prev) => ({ ...prev, [menuItem.id]: true }))

    const currentDisplayQuantity = itemQuantities[menuItem.id]?.quantity || 0
    const newDisplayQuantity = currentDisplayQuantity + 1
    let tempCartItemIdForOptimistic =
      itemQuantities[menuItem.id]?.cartItemId || menuItem.id

    // Optimistic Update for the base item's displayed quantity
    setItemQuantities((prev) => ({
      ...prev,
      [menuItem.id]: {
        cartItemId: tempCartItemIdForOptimistic,
        quantity: newDisplayQuantity,
      },
    }))

    try {
      const result = await addToCart(menuItem, 1, undefined, addOnsReceived)
      let finalCartItemId: number | null = null

      if (result && result.id) {
        finalCartItemId = result.id
        // If backend created a new cart item, update local state to use this new cartItemId
        // especially if the previous optimistic one was just menuItem.id
        if (tempCartItemIdForOptimistic === menuItem.id) {
          setItemQuantities((prev) => ({
            ...prev,
            [menuItem.id]: {
              ...prev[menuItem.id],
              cartItemId: finalCartItemId!,
            },
          }))
        }
      }

      if (finalCartItemId) {
        // For pancakes, each configuration might be a new item or update an existing one.
        // We emit the change based on the base menuItem.id and its new display quantity.
        appEvents.emit('cartItemQuantityChanged', {
          menuItemId: menuItem.id,
          newQuantity: newDisplayQuantity,
          cartItemId: finalCartItemId,
        })
      }
      appEvents.emit('cartUpdated')
      const addOnsText =
        addOnsReceived.length > 0
          ? ` (${addOnsReceived.map((ao) => ao.name).join(', ')})`
          : ''
      toast.success(`${menuItem.name}${addOnsText} 已添加到购物车`, {
        duration: 2000,
        icon: '🥞',
      })
    } catch (error) {
      console.error('Error adding pancake to cart:', error)
      toast.error('添加到购物车失败，请重试')
      // Revert optimistic update for the base item's display
      setItemQuantities((prev) => {
        const revertedQtys = { ...prev }
        if (currentDisplayQuantity === 0) {
          delete revertedQtys[menuItem.id]
        } else {
          revertedQtys[menuItem.id] = {
            cartItemId: tempCartItemIdForOptimistic,
            quantity: currentDisplayQuantity,
          }
        }
        return revertedQtys
      })
      appEvents.emit('cartUpdated')
    } finally {
      setCompanionDialogOpen(false)
      setTimeout(
        () => setIsAddingToCart((prev) => ({ ...prev, [menuItem.id]: false })),
        300
      )
    }
  }

  const handleCategoryChange = (
    _: React.SyntheticEvent,
    newValue: 'all' | 'sushi' | 'handroll' | 'pancake'
  ) => {
    setActiveCategory(newValue)
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        component="section"
        id="menu"
        sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              正在加载菜单...
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} key={index}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={100}
                  sx={{ borderRadius: 2, mb: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      component="section"
      id="menu"
      sx={{
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        position: 'relative',
      }}>
      {/* Decorative element */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      />

      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
              position: 'relative',
            }}>
            我们的菜单
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto' }}>
            发现我们精选的使用最优质食材新鲜制作的美食。每一份都精心制作，为您带来美妙的味觉体验。
          </Typography>
        </Box>

        {/* Category filter */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={0} sx={{ backgroundColor: 'background.default' }}>
            <Tabs
              value={activeCategory}
              onChange={handleCategoryChange}
              indicatorColor="primary"
              textColor="primary"
              centered={!isMobile}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
              sx={{
                '.MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '2px 2px 0 0',
                },
              }}>
              <CategoryTab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RestaurantIcon sx={{ mr: 1, fontSize: 18 }} />
                    全部菜单
                  </Box>
                }
                value="all"
              />
              <CategoryTab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>🍣</span>
                    寿司
                  </Box>
                }
                value="sushi"
              />
              <CategoryTab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>🍙</span>
                    手卷
                  </Box>
                }
                value="handroll"
              />
              <CategoryTab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>🥞</span>
                    煎饼
                  </Box>
                }
                value="pancake"
              />
            </Tabs>
          </Paper>
        </Box>

        {/* Menu items grid */}
        <MotionContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <Grid container spacing={3} justifyContent="center">
            {isLoading
              ? Array.from(new Array(6)).map((_, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      [theme.breakpoints.down('sm')]: {
                        padding: '16px 0',
                      },
                    }}>
                    {/* Loading skeleton */}
                    <Skeleton
                      variant="rectangular"
                      width="320px"
                      height={350}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                ))
              : filteredItems.map((menuItem) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={menuItem.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      [theme.breakpoints.down('sm')]: {
                        padding: '16px 0',
                      },
                    }}>
                    {/* Menu item card */}
                    <MotionItem
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}>
                      <StyledCard>
                        {(menuItem.image || fallbackImageUrl) && (
                          <CardImageContainer>
                            <StyledCardMedia
                              image={`/images/product_img/${menuItem.id}.png`}
                              title={menuItem.name}
                              onError={handleImageError}
                            />
                            <Box
                              sx={{ position: 'absolute', top: 10, left: 10 }}>
                              <CategoryChip
                                label={
                                  menuItem.category === 'sushi'
                                    ? '寿司'
                                    : menuItem.category === 'handroll'
                                    ? '手卷'
                                    : '煎饼'
                                }
                                size="small"
                                className={menuItem.category}
                              />
                            </Box>
                          </CardImageContainer>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 1,
                            }}>
                            <Typography
                              variant="h6"
                              component="h3"
                              sx={{
                                fontWeight: 'bold',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minHeight: 48,
                                maxHeight: 48,
                              }}>
                              {menuItem.name}
                            </Typography>
                            <PriceChip label={menuItem.price} size="small" />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minHeight: 40,
                              maxHeight: 40,
                            }}>
                            {menuItem.description}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                            <Chip
                              label={
                                <Typography variant="caption">
                                  {menuItem.category === 'sushi'
                                    ? '寿司 / Sushi'
                                    : menuItem.category === 'handroll'
                                    ? '手卷 / Hand Roll'
                                    : '煎饼 / Pancake'}
                                </Typography>
                              }
                              size="small"
                              sx={{
                                backgroundColor: 'background.default',
                                border: '1px solid',
                                borderColor:
                                  menuItem.category === 'sushi'
                                    ? 'secondary.light'
                                    : menuItem.category === 'handroll'
                                    ? 'primary.light'
                                    : 'warning.light',
                              }}
                            />
                            {menuItem.featured && (
                              <IconButton
                                size="small"
                                color="warning"
                                sx={{
                                  animation: 'pulse 2s infinite',
                                  '@keyframes pulse': {
                                    '0%': { transform: 'scale(0.95)' },
                                    '70%': { transform: 'scale(1)' },
                                    '100%': { transform: 'scale(0.95)' },
                                  },
                                }}>
                                <FavoriteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </CardContent>
                        <Divider />
                        <CardActions sx={{ p: 2 }}>
                          <AnimatePresence mode="wait">
                            {!itemQuantities[menuItem.id] ? (
                              <motion.div
                                key="add-btn"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                style={{ width: '100%' }}>
                                <ReserveButton
                                  fullWidth
                                  variant="contained"
                                  startIcon={<ShoppingCartIcon />}
                                  onClick={() => handleAddToCart(menuItem)}
                                  disabled={isAddingToCart[menuItem.id]}>
                                  {isAddingToCart[menuItem.id]
                                    ? '预定中...'
                                    : '预定'}
                                </ReserveButton>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="quantity-control"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                style={{ width: '100%' }}>
                                <QuantityControlContainer>
                                  <QuantityButton
                                    aria-label="减少数量"
                                    onClick={() =>
                                      handleRemoveFromCart(menuItem)
                                    }
                                    size="small">
                                    <RemoveIcon fontSize="small" />
                                  </QuantityButton>

                                  <QuantityText variant="h6">
                                    {itemQuantities[menuItem.id]?.quantity || 0}
                                  </QuantityText>

                                  <QuantityButton
                                    aria-label="增加数量"
                                    onClick={() => handleAddToCart(menuItem)}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        theme.palette.primary.main,
                                      color: 'white',
                                      '&:hover': {
                                        backgroundColor:
                                          theme.palette.primary.dark,
                                      },
                                    }}>
                                    <AddIcon fontSize="small" />
                                  </QuantityButton>
                                </QuantityControlContainer>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardActions>
                      </StyledCard>
                    </MotionItem>
                  </Grid>
                ))}
          </Grid>
        </MotionContainer>

        {/* View all link */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="#contact"
            sx={{
              borderRadius: '50px',
              px: 4,
              py: 1.5,
              boxShadow: theme.shadows[4],
            }}>
            查看完整菜单
          </Button>
        </Box>

        {/* Companion Selection Dialog */}
        <CompanionSelectionDialog
          open={companionDialogOpen}
          onClose={() => setCompanionDialogOpen(false)}
          onAddToCart={handleAddPancakeWithCompanions}
          menuItem={selectedMenuItem}
        />
      </Container>
    </Box>
  )
}

export default Menu
