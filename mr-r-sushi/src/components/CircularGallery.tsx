import { useState, useEffect } from 'react'
import Slider from 'react-slick'
import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
  Button,
  useMediaQuery,
  styled,
  IconButton,
  ButtonGroup,
  Tooltip,
  Zoom,
  CircularProgress,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  LocalFireDepartment as FireIcon,
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import {
  addToCart,
  updateCartItemQuantity,
  getAllCartItemsFromStorage,
  removeCartItem as removeCartItemService,
} from '../services/cartService'
import { getAllMenuItems as fetchAllMenuItems } from '../services/menuService'
import type { MenuItem } from '../types/menu'
import CompanionSelectionDialog from './CompanionSelectionDialog'
import { appEvents } from '../utils/appEvents'

// Styled components
const GalleryContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  minHeight: 600,
  maxHeight: 900,
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const SliderWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  position: 'relative',
  '& .slick-list': {
    overflow: 'visible',
  },
  '& .slick-slide': {
    opacity: 0.4,
    transition: 'all 0.3s ease',
    transform: 'scale(0.8)',
  },
  '& .slick-center': {
    opacity: 1,
    transform: 'scale(1)',
  },
}))

const SlideItem = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2),
  height: 500,
  display: 'flex !important',
  alignItems: 'center',
  justifyContent: 'center',
}))

const ItemCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    transform: 'translateY(-10px)',
  },
}))

const CardImageContainer = styled(Box)(({ theme }) => ({
  height: '65%',
  overflow: 'hidden',
  position: 'relative',
}))

const CardImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}))

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flex: 1,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}))

const PriceTag = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 16,
  top: 16,
  backgroundColor: 'rgba(255, 152, 0, 0.9)',
  color: 'white',
  padding: theme.spacing(0.75, 2),
  borderRadius: 20,
  fontWeight: 'bold',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  zIndex: 2,
}))

const CategoryTag = styled(Box)<{ category: string }>(
  ({ theme, category }) => ({
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor:
      category === 'sushi'
        ? 'rgba(3, 169, 244, 0.9)'
        : category === 'handroll'
        ? 'rgba(156, 39, 176, 0.9)'
        : 'rgba(255, 87, 34, 0.9)',
    color: 'white',
    padding: theme.spacing(0.75, 2),
    borderRadius: 20,
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: 2,
    textTransform: 'capitalize',
  })
)

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

const BackgroundDecoration = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  overflow: 'hidden',
  opacity: 0.5,
}))

const Circle = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light,
  opacity: 0.1,
}))

// Define AddOnOption interface locally (ideally, this would be a shared type)
interface AddOnOption {
  id?: string | number
  name: string
  price: number
}

interface CartItemQuantity {
  cartItemId: number
  quantity: number
}

interface CartItemQuantityChangedPayload {
  menuItemId: number
  newQuantity: number
  cartItemId: number
}

// Helper type guard for data with $values (if menu service response needs it)
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

const CircularGallery = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemQuantities, setItemQuantities] = useState<
    Record<number, { cartItemId: number; quantity: number }>
  >({})
  const [selectedPancake, setSelectedPancake] = useState<MenuItem | null>(null)
  const [companionDialogOpen, setCompanionDialogOpen] = useState(false)

  const [galleryItems, setGalleryItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAndSetGalleryItems = async () => {
      setIsLoading(true)
      try {
        const menuResponse = await fetchAllMenuItems()
        let allItems: MenuItem[] = []
        if (menuResponse.success) {
          if (isDataWithValues(menuResponse.data)) {
            allItems = menuResponse.data.$values
          } else if (Array.isArray(menuResponse.data)) {
            allItems = menuResponse.data
          } else {
            console.error('Unexpected menu data format:', menuResponse.data)
          }
        }

        if (allItems.length > 0) {
          const featuredItems = allItems.filter((item) => item.featured)
          if (featuredItems.length > 0) {
            setGalleryItems(featuredItems)
          } else {
            // Fallback: show the first 6 items if no featured items
            setGalleryItems(allItems.slice(0, 6))
          }
        } else {
          // Handle case where no items are fetched (e.g., show a default or empty state)
          setGalleryItems([])
        }
      } catch (error) {
        console.error('Error fetching menu items for gallery:', error)
        toast.error('无法加载推荐商品')
        setGalleryItems([]) // Set to empty on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchAndSetGalleryItems()
  }, [])

  // New useEffect to initialize itemQuantities from cartService
  useEffect(() => {
    if (galleryItems.length > 0) {
      const persistedCartItems = getAllCartItemsFromStorage()
      const initialQuantities: Record<
        number,
        { cartItemId: number; quantity: number }
      > = {}
      persistedCartItems.forEach((cartItem) => {
        // Ensure the gallery item exists before setting quantity
        const galleryItemExists = galleryItems.find(
          (gi) => gi.id === cartItem.menuItemId
        )
        if (galleryItemExists) {
          initialQuantities[cartItem.menuItemId] = {
            cartItemId: cartItem.id, // This is the cart item's own ID
            quantity: cartItem.quantity,
          }
        }
      })
      setItemQuantities(initialQuantities)
    }
  }, [galleryItems]) // Run when galleryItems are populated

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

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: galleryItems.length > (isMobile ? 1 : 3), // Ensure infinite scroll is only if enough items
    centerPadding: '60px',
    slidesToShow: isMobile ? 1 : Math.min(3, galleryItems.length || 1), // Adjust to number of items
    speed: 500,
    dots: true,
    arrows: !isMobile,
    autoplay: true,
    autoplaySpeed: 3000,
    beforeChange: (current: number, next: number) => setCurrentSlide(next),
  }

  // Random circles for background decoration
  const circles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    size: 100 + Math.random() * 300,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 20,
  }))

  const handleAddToCart = async (item: MenuItem) => {
    // Check if the item is a pancake and needs companion selection
    if (item.category === 'pancake' && item.name.includes('煎饼')) {
      setSelectedPancake(item)
      setCompanionDialogOpen(true)
      return
    }

    const existingQuantityInfo = itemQuantities[item.id]
    const currentQuantity = existingQuantityInfo?.quantity || 0
    const newQuantity = currentQuantity + 1
    let cartItemId = existingQuantityInfo?.cartItemId

    setItemQuantities((prev) => ({
      ...prev,
      [item.id]: { cartItemId: cartItemId || item.id, quantity: newQuantity },
    }))

    try {
      if (currentQuantity > 0 && cartItemId) {
        await updateCartItemQuantity(cartItemId, newQuantity)
      } else {
        const result = await addToCart({ ...item }, 1)
        if (result && result.id) cartItemId = result.id
      }
      if (cartItemId) {
        appEvents.emit('cartItemQuantityChanged', {
          menuItemId: item.id,
          newQuantity,
          cartItemId,
        })
      }
      appEvents.emit('cartUpdated')
      toast.success(`${item.name} 已预定`, {
        icon: '🍽️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('预定失败', {
        icon: '❌',
      })
      setItemQuantities((prev) => ({
        ...prev,
        [item.id]: {
          cartItemId: cartItemId || item.id,
          quantity: currentQuantity,
        },
      })) // Revert
      appEvents.emit('cartUpdated')
    }
  }

  // Handler for adding pancake with companions from the dialog
  const handleAddPancakeWithCompanions = async (
    addOnsReceived: AddOnOption[]
  ) => {
    if (!selectedPancake) return

    const item = selectedPancake
    const newQuantity = (itemQuantities[item.id]?.quantity || 0) + 1
    let cartItemId = itemQuantities[item.id]?.cartItemId

    setItemQuantities((prev) => ({
      ...prev,
      [item.id]: { cartItemId: cartItemId || item.id, quantity: newQuantity },
    }))

    try {
      const result = await addToCart({ ...item }, 1, undefined, addOnsReceived)
      if (result && result.id) cartItemId = result.id

      if (cartItemId) {
        appEvents.emit('cartItemQuantityChanged', {
          menuItemId: item.id,
          newQuantity,
          cartItemId,
        })
      }
      appEvents.emit('cartUpdated')
      const addOnsText =
        addOnsReceived.length > 0
          ? ` (${addOnsReceived.map((ao) => ao.name).join(', ')})`
          : ''
      toast.success(`${item.name}${addOnsText} 已预定`, {
        icon: '🥞',
      })
    } catch (error) {
      console.error('Error adding pancake to cart:', error)
      toast.error('预定失败', { icon: '❌' })
      setItemQuantities((prev) => ({
        ...prev,
        [item.id]: {
          cartItemId: cartItemId || item.id,
          quantity: newQuantity - 1,
        },
      })) // Revert
      appEvents.emit('cartUpdated')
    } finally {
      setCompanionDialogOpen(false)
      setSelectedPancake(null)
    }
  }

  const handleRemoveFromCart = async (item: MenuItem) => {
    const existingQuantityInfo = itemQuantities[item.id]
    if (!existingQuantityInfo || existingQuantityInfo.quantity <= 0) return

    const originalQuantity = existingQuantityInfo.quantity
    const cartItemId = existingQuantityInfo.cartItemId
    const newQuantity = originalQuantity - 1

    setItemQuantities((prev) => {
      const newQtys = { ...prev }
      if (newQuantity === 0) delete newQtys[item.id]
      else newQtys[item.id] = { ...newQtys[item.id], quantity: newQuantity }
      return newQtys
    })

    try {
      if (newQuantity === 0) {
        await removeCartItemService(cartItemId) // Use the imported service
      } else {
        await updateCartItemQuantity(cartItemId, newQuantity)
      }
      appEvents.emit('cartItemQuantityChanged', {
        menuItemId: item.id,
        newQuantity,
        cartItemId,
      })
      appEvents.emit('cartUpdated')
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('更新购物车失败', {
        icon: '❌',
      })
      setItemQuantities((prev) => ({
        ...prev,
        [item.id]: { cartItemId, quantity: originalQuantity },
      })) // Revert
      appEvents.emit('cartUpdated')
    }
  }

  if (isLoading) {
    return (
      <GalleryContainer id="home">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>加载推荐中...</Typography>
        </Box>
      </GalleryContainer>
    )
  }

  if (galleryItems.length === 0 && !isLoading) {
    return (
      <GalleryContainer id="home">
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h5" color="textSecondary">
            暂无推荐商品
          </Typography>
        </Box>
      </GalleryContainer>
    )
  }

  return (
    <GalleryContainer id="home">
      {/* Background decoration */}
      <BackgroundDecoration>
        {circles.map((circle) => (
          <Circle
            key={circle.id}
            style={{
              width: circle.size,
              height: circle.size,
              left: `${circle.x}%`,
              top: `${circle.y}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: circle.duration,
              repeat: Infinity,
              delay: circle.delay,
            }}
          />
        ))}
      </BackgroundDecoration>

      <Container maxWidth="xl">
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}>
                Mr. R 寿司
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}>
              <Typography
                variant="h5"
                color="textSecondary"
                sx={{ maxWidth: 700, mx: 'auto' }}>
                体验传统日式风味与现代创新的美妙结合
              </Typography>
            </motion.div>
          </Box>

          <SliderWrapper>
            <Slider {...settings}>
              {galleryItems.map((item, index) => (
                <SlideItem
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}>
                  <ItemCard elevation={6}>
                    <CardImageContainer>
                      <PriceTag>{item.price}</PriceTag>
                      <CategoryTag category={item.category || 'sushi'}>
                        {item.category === 'sushi'
                          ? '寿司'
                          : item.category === 'handroll'
                          ? '手卷'
                          : item.category === 'pancake'
                          ? '煎饼'
                          : '美食'}
                      </CategoryTag>
                      <CardImage
                        src={
                          item.image
                            ? item.image.startsWith('http') ||
                              item.image.startsWith('/')
                              ? item.image
                              : `/images/product_img/${item.image}`
                            : '/images/product_img/default.png'
                        }
                        alt={item.name}
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement
                          imgElement.onerror = null
                          imgElement.src = '/images/product_img/1.png'
                        }}
                      />
                    </CardImageContainer>
                    <CardContent>
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}>
                          <Typography
                            variant="h5"
                            component="h3"
                            sx={{ fontWeight: 'bold' }}>
                            {item.name}
                          </Typography>
                          {item.featured && (
                            <Tooltip
                              title="人气推荐"
                              placement="top"
                              TransitionComponent={Zoom}>
                              <FireIcon
                                sx={{ color: theme.palette.warning.main }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, minHeight: 40 }}>
                          {item.description}
                        </Typography>
                      </Box>

                      <AnimatePresence mode="wait">
                        {!itemQuantities[item.id] ? (
                          <motion.div
                            key="add-btn"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}>
                            <ReserveButton
                              variant="contained"
                              fullWidth
                              onClick={() => handleAddToCart(item)}
                              startIcon={<ShoppingCartIcon />}>
                              预定
                            </ReserveButton>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="quantity-control"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}>
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
                    </CardContent>
                  </ItemCard>
                </SlideItem>
              ))}
            </Slider>
          </SliderWrapper>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                href="#menu"
                sx={{
                  borderRadius: 4,
                  px: 4,
                  py: 1.5,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}>
                浏览完整菜单
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Container>
      {/* Companion Selection Dialog for Pancakes */}
      <CompanionSelectionDialog
        open={companionDialogOpen}
        onClose={() => setCompanionDialogOpen(false)}
        onAddToCart={handleAddPancakeWithCompanions}
        menuItem={selectedPancake}
      />
    </GalleryContainer>
  )
}

export default CircularGallery
