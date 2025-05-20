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
import { getAllMenuItems, getFeaturedItems } from '../services/menuService'
import { addToCart, updateCartItemQuantity } from '../services/cartService'
import CompanionSelectionDialog from './CompanionSelectionDialog'

// Animation variants
const MotionContainer = styled(motion.div)({
  width: '100%',
})

const MotionItem = styled(motion.div)({
  width: '100%',
})

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

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
  },
}))

const CardImageContainer = styled(Box)({
  position: 'relative',
  paddingTop: '60%', // 16:9 aspect ratio
})

const StyledCardMedia = styled(CardMedia)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

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

// Main Menu Component
const Menu = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const [activeCategory, setActiveCategory] = useState<
    'all' | 'sushi' | 'handroll' | 'pancake'
  >('all')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: number]: boolean
  }>({})
  // Add itemQuantities state to track quantities
  const [itemQuantities, setItemQuantities] = useState<{
    [key: number]: { cartItemId: number; quantity: number }
  }>({})

  // State for companion selection dialog
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  )

  // Fallback image for when an image fails to load
  const fallbackImageUrl =
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop'

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImageUrl
  }

  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true)
      try {
        const items = await getAllMenuItems()
        setMenuItems(items)

        const featured = await getFeaturedItems()
        setFeaturedItems(featured)
      } catch (error) {
        console.error('Error loading menu data:', error)
        toast.error('无法加载菜单数据，请稍后重试')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  // Modify handleAddToCart to update quantities
  const handleAddToCart = async (menuItem: MenuItem) => {
    // Check if this is a pancake item that needs companion selection
    if (menuItem.category === 'pancake' && menuItem.name.includes('煎饼')) {
      setSelectedMenuItem(menuItem)
      setCompanionDialogOpen(true)
      return
    }

    try {
      setIsAddingToCart((prev) => ({ ...prev, [menuItem.id]: true }))

      // If item is already in cart, increase quantity
      if (itemQuantities[menuItem.id]) {
        await updateCartItemQuantity(
          itemQuantities[menuItem.id].cartItemId,
          itemQuantities[menuItem.id].quantity + 1
        )

        setItemQuantities({
          ...itemQuantities,
          [menuItem.id]: {
            ...itemQuantities[menuItem.id],
            quantity: itemQuantities[menuItem.id].quantity + 1,
          },
        })
      } else {
        // Add new item to cart
        const result = await addToCart(menuItem, 1)

        // Store cart item ID and quantity
        setItemQuantities({
          ...itemQuantities,
          [menuItem.id]: {
            cartItemId: result.id || menuItem.id,
            quantity: 1,
          },
        })
      }

      // Success notification
      toast.success(`${menuItem.name} 已预定`, {
        duration: 2000,
        icon: '🍽️',
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('预定失败，请重试')
    } finally {
      // Clear loading state
      setTimeout(() => {
        setIsAddingToCart((prev) => ({ ...prev, [menuItem.id]: false }))
      }, 300)
    }
  }

  // Add handleRemoveFromCart function
  const handleRemoveFromCart = async (menuItem: MenuItem) => {
    if (
      !itemQuantities[menuItem.id] ||
      itemQuantities[menuItem.id].quantity <= 0
    )
      return

    try {
      const newQuantity = itemQuantities[menuItem.id].quantity - 1

      if (newQuantity === 0) {
        // Remove item completely from our local state
        const newQuantities = { ...itemQuantities }
        delete newQuantities[menuItem.id]
        setItemQuantities(newQuantities)

        // Call removeCartItem here if you have that function
        // await removeCartItem(itemQuantities[menuItem.id].cartItemId)
      } else {
        // Update quantity
        await updateCartItemQuantity(
          itemQuantities[menuItem.id].cartItemId,
          newQuantity
        )

        setItemQuantities({
          ...itemQuantities,
          [menuItem.id]: {
            ...itemQuantities[menuItem.id],
            quantity: newQuantity,
          },
        })
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error('更新失败，请重试')
    }
  }

  // Handle adding pancake with companions to cart
  const handleAddPancakeWithCompanions = async (companions: string[]) => {
    if (!selectedMenuItem) return

    try {
      setIsAddingToCart((prev) => ({ ...prev, [selectedMenuItem.id]: true }))
      await addToCart(selectedMenuItem, 1, companions)

      // Success notification with companions
      const companionsText =
        companions.length > 0 ? ` (${companions.join(', ')})` : ''

      toast.success(
        `${selectedMenuItem.name}${companionsText} 已添加到购物车`,
        {
          duration: 2000,
          icon: '🥞',
        }
      )
    } catch (error) {
      console.error('Error adding pancake to cart:', error)
      toast.error('添加到购物车失败，请重试')
    } finally {
      // Close dialog and clear loading state
      setCompanionDialogOpen(false)
      setTimeout(() => {
        if (selectedMenuItem) {
          setIsAddingToCart((prev) => ({
            ...prev,
            [selectedMenuItem.id]: false,
          }))
        }
      }, 300)
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
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={220} />
                  <CardContent>
                    <Skeleton variant="text" height={30} width="70%" />
                    <Skeleton variant="text" height={20} width="40%" />
                    <Skeleton variant="text" height={60} />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rectangular" height={36} width={120} />
                  </CardActions>
                </Card>
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

        {/* Featured items section - Only on mobile and tablet */}
        {(isMobile || isTablet) && featuredItems.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              特色菜品{' '}
              <HotIcon sx={{ ml: 1, color: theme.palette.warning.main }} />
            </Typography>
            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto',
                pb: 2,
                gap: 2,
                '&::-webkit-scrollbar': { height: '4px' },
                '&::-webkit-scrollbar-track': {
                  background: theme.palette.background.default,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.primary.main,
                  borderRadius: '4px',
                },
              }}>
              {featuredItems.map((item) => (
                <Card
                  key={`featured-${item.id}`}
                  sx={{
                    minWidth: 240,
                    maxWidth: 280,
                    borderColor: theme.palette.warning.light,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    flexShrink: 0,
                    height: 400, // Fixed height for consistency
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <CardImageContainer>
                    <StyledCardMedia
                      image={item.image || fallbackImageUrl}
                      title={item.name}
                      onError={handleImageError}
                    />
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                      <Chip
                        icon={<HotIcon />}
                        label="特色"
                        size="small"
                        sx={{
                          backgroundColor: theme.palette.warning.main,
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  </CardImageContainer>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}>
                      <Typography variant="h6" component="h3">
                        {item.name}
                      </Typography>
                      <PriceChip label={item.price} size="small" />
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ height: 40, overflow: 'hidden' }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <AnimatePresence mode="wait">
                      {!itemQuantities[item.id] ? (
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
                            onClick={() => handleAddToCart(item)}
                            disabled={isAddingToCart[item.id]}>
                            {isAddingToCart[item.id] ? '预定中...' : '预定'}
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
                              onClick={() => handleRemoveFromCart(item)}
                              size="small">
                              <RemoveIcon fontSize="small" />
                            </QuantityButton>

                            <QuantityText variant="h6">
                              {itemQuantities[item.id]?.quantity || 0}
                            </QuantityText>

                            <QuantityButton
                              aria-label="增加数量"
                              onClick={() => handleAddToCart(item)}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.dark,
                                },
                              }}>
                              <AddIcon fontSize="small" />
                            </QuantityButton>
                          </QuantityControlContainer>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>
        )}

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
          <Grid container spacing={3}>
            {filteredItems.length > 0 ? (
              filteredItems.map((menuItem) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={`${activeCategory}-${menuItem.id}`}>
                  <MotionItem
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}>
                    <StyledCard sx={{ height: 450 }}>
                      {' '}
                      {/* Fixed height for consistency */}
                      {menuItem.image && (
                        <CardImageContainer>
                          <StyledCardMedia
                            image={menuItem.image}
                            title={menuItem.name}
                            onError={handleImageError}
                          />
                          {menuItem.featured && (
                            <Box
                              sx={{ position: 'absolute', top: 10, right: 10 }}>
                              <Chip
                                icon={<HotIcon />}
                                label="特色"
                                size="small"
                                sx={{
                                  backgroundColor: theme.palette.warning.main,
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              />
                            </Box>
                          )}
                          <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
                            <Chip
                              label={
                                menuItem.category === 'sushi'
                                  ? '寿司'
                                  : menuItem.category === 'handroll'
                                  ? '手卷'
                                  : '煎饼'
                              }
                              size="small"
                              sx={{
                                backgroundColor:
                                  menuItem.category === 'sushi'
                                    ? theme.palette.secondary.main
                                    : menuItem.category === 'handroll'
                                    ? theme.palette.primary.main
                                    : theme.palette.warning.main,
                                color: 'white',
                              }}
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
                            sx={{ fontWeight: 'bold' }}>
                            {menuItem.name}
                          </Typography>
                          <PriceChip label={menuItem.price} size="small" />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
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
                                  onClick={() => handleRemoveFromCart(menuItem)}
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
                                    backgroundColor: theme.palette.primary.main,
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
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography>暂无该分类的菜品</Typography>
                </Box>
              </Grid>
            )}
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
