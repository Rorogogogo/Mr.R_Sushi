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
import { addToCart, updateCartItemQuantity } from '../services/cartService'
import type { MenuItem } from '../types/menu'

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

interface CartItemQuantity {
  cartItemId: number
  quantity: number
}

// Gallery items from the actual menu data
const galleryItems = [
  {
    id: 1,
    name: '招牌寿司',
    description: 'Signature sushi with fresh ingredients and our special sauce',
    price: '13元',
    image: '/images/sushi-signature.jpg',
    featured: true,
    category: 'sushi',
  },
  {
    id: 6,
    name: '鱼子酱寿司',
    description: 'Premium fish roe sushi with exquisite taste',
    price: '16元',
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop',
    featured: false,
    category: 'sushi',
  },
  {
    id: 9,
    name: '金枪鱼鹌鹑蛋芝士寿司',
    description: 'Tuna with quail egg and cheese sushi, premium taste',
    price: '22元',
    image:
      'https://images.unsplash.com/photo-1579698501607-b34c7288541a?q=80&w=300&auto=format&fit=crop',
    featured: false,
    category: 'sushi',
  },
  {
    id: 14,
    name: '鱼子手卷',
    description: 'Fish roe hand roll with premium roe',
    price: '7元',
    image:
      'https://images.unsplash.com/photo-1540713304937-18ad930d3594?q=80&w=300&auto=format&fit=crop',
    featured: false,
    category: 'handroll',
  },
  {
    id: 17,
    name: '杂粮煎饼',
    description: '单蛋 + 蔬菜 + 沙拉，健康美味',
    price: '7元',
    image:
      'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=60',
    featured: true,
    category: 'pancake',
  },
  {
    id: 22,
    name: '火焰芝士火鸡面煎饼',
    description: '双蛋 + 芝士 + 蔬菜 + 火鸡面，豪华美味',
    price: '22元',
    image:
      'https://images.unsplash.com/photo-1598215439219-738c1b65700a?w=800&auto=format&fit=crop&q=60',
    featured: true,
    category: 'pancake',
  },
]

const CircularGallery = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [currentSlide, setCurrentSlide] = useState(0)
  // State to track quantity for each item
  const [itemQuantities, setItemQuantities] = useState<
    Record<number, CartItemQuantity>
  >({})

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '60px',
    slidesToShow: isMobile ? 1 : 3,
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
    try {
      // If item is already in cart, increase quantity by 1
      if (itemQuantities[item.id]) {
        await updateCartItemQuantity(
          itemQuantities[item.id].cartItemId,
          itemQuantities[item.id].quantity + 1
        )

        setItemQuantities({
          ...itemQuantities,
          [item.id]: {
            ...itemQuantities[item.id],
            quantity: itemQuantities[item.id].quantity + 1,
          },
        })
      } else {
        // Add to cart with quantity 1
        const result = await addToCart(
          {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
          },
          1
        )

        // Store cart item ID and quantity
        setItemQuantities({
          ...itemQuantities,
          [item.id]: {
            cartItemId: result.id,
            quantity: 1,
          },
        })
      }

      // Show success toast - updated message for reservation
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
    }
  }

  const handleRemoveFromCart = async (item: MenuItem) => {
    if (!itemQuantities[item.id] || itemQuantities[item.id].quantity <= 0)
      return

    try {
      const newQuantity = itemQuantities[item.id].quantity - 1

      if (newQuantity === 0) {
        // Remove item from cart
        // You would call a removeFromCart service here

        // Remove from our local state
        const newQuantities = { ...itemQuantities }
        delete newQuantities[item.id]
        setItemQuantities(newQuantities)
      } else {
        // Update quantity
        await updateCartItemQuantity(
          itemQuantities[item.id].cartItemId,
          newQuantity
        )

        setItemQuantities({
          ...itemQuantities,
          [item.id]: {
            ...itemQuantities[item.id],
            quantity: newQuantity,
          },
        })
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('更新购物车失败', {
        icon: '❌',
      })
    }
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
                      <CategoryTag category={item.category}>
                        {item.category === 'sushi'
                          ? '寿司'
                          : item.category === 'handroll'
                          ? '手卷'
                          : '煎饼'}
                      </CategoryTag>
                      <CardImage
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement
                          imgElement.onerror = null
                          imgElement.src =
                            'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop'
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
    </GalleryContainer>
  )
}

export default CircularGallery
