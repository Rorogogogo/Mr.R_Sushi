import { useState, useEffect } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Tabs,
  Tab,
  useScrollTrigger,
  Container,
  useTheme,
  useMediaQuery,
  styled,
  Divider,
  ListItemIcon,
  Slide,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import Cart from './Cart'
import { getCartItems } from '../services/cartService'

type CartItem = {
  id: number
  quantity: number
}

type HeaderProps = {
  setCartOpen: (isOpen: boolean) => void
}

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  backgroundImage: 'none',
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  minWidth: 'auto',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}))

const BrandTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
}))

const LogoContainer = styled(motion.div)({
  display: 'flex',
  alignItems: 'center',
})

const EmojiSpan = styled(motion.span)({
  marginLeft: '8px',
  display: 'inline-block',
})

// Scroll effect function
function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  })

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

const Header = ({ setCartOpen }: HeaderProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Navigation items configuration
  const navItems = [
    { id: 'home', label: '首页', icon: <HomeIcon /> },
    { id: 'menu', label: '菜单', icon: <RestaurantIcon /> },
    { id: 'about', label: '关于我们', icon: <InfoIcon /> },
    { id: 'contact', label: '联系方式', icon: <PhoneIcon /> },
  ]

  // Handle scroll events for header appearance and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      // Determine which section is currently in view
      const sections = ['home', 'menu', 'about', 'contact']
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle navigation click
  const handleNavClick = (section: string) => {
    // Close mobile menu if open
    if (isMobile) {
      setIsMenuOpen(false)
    }

    // Scroll to section
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Open the cart
  const handleOpenCart = () => {
    setCartOpen(true)
    // Also update our local state
    setIsCartOpen(true)

    // If mobile menu is open, close it
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  // Handle cart close
  const handleCloseCart = () => {
    setIsCartOpen(false)
    setCartOpen(false)
  }

  return (
    <>
      <HideOnScroll>
        <StyledAppBar
          position="fixed"
          sx={{
            bgcolor: scrolled
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(245, 250, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: scrolled ? 1 : 0,
            borderColor: 'divider',
            color: 'text.primary',
            py: scrolled ? 0 : 0.5,
            height: 'auto', // Reduced height
          }}>
          {/* Decorative top border */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          />

          <Container maxWidth="lg">
            <Toolbar
              disableGutters
              sx={{
                justifyContent: 'space-between',
                minHeight: { xs: '56px', sm: '64px' }, // Reduced toolbar height
                py: 0.5,
              }}>
              {/* Logo */}
              <LogoContainer
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}>
                <Button
                  component="a"
                  href="#home"
                  color="inherit"
                  sx={{
                    textTransform: 'none',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                  }}>
                  <BrandTypography variant={scrolled ? 'h6' : 'h5'}>
                    Mr. R 寿司
                  </BrandTypography>
                  <EmojiSpan
                    style={{ fontSize: scrolled ? '1.2rem' : '1.5rem' }}>
                    🍣
                  </EmojiSpan>
                </Button>
              </LogoContainer>

              {/* Mobile Menu Icon */}
              <Box
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  alignItems: 'center',
                }}>
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={() => setIsMenuOpen(true)}
                  sx={{
                    bgcolor: isMenuOpen ? 'rgba(0,0,0,0.05)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
                  }}>
                  <MenuIcon />
                </IconButton>
              </Box>

              {/* Desktop Navigation */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                }}>
                <Tabs
                  value={activeSection}
                  TabIndicatorProps={{
                    style: {
                      backgroundColor: theme.palette.primary.main,
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                    },
                  }}>
                  {navItems.map((item) => (
                    <StyledTab
                      key={item.id}
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 0.5,
                          }}>
                          {item.id === activeSection && (
                            <Box
                              component="span"
                              sx={{ mr: 0.75, display: 'flex' }}>
                              {item.icon}
                            </Box>
                          )}
                          {item.label}
                        </Box>
                      }
                      value={item.id}
                      onClick={() => handleNavClick(item.id)}
                    />
                  ))}
                </Tabs>
              </Box>
            </Toolbar>
          </Container>
        </StyledAppBar>
      </HideOnScroll>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          },
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}>
          <BrandTypography variant="h6">Mr. R 寿司</BrandTypography>
          <IconButton onClick={() => setIsMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <List>
          {navItems.map((item) => (
            <ListItem
              key={item.id}
              sx={{
                borderLeft:
                  activeSection === item.id
                    ? `4px solid ${theme.palette.primary.main}`
                    : '4px solid transparent',
                bgcolor:
                  activeSection === item.id
                    ? 'rgba(0,0,0,0.04)'
                    : 'transparent',
                py: 1.5,
                cursor: 'pointer',
              }}
              onClick={() => handleNavClick(item.id)}>
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: activeSection === item.id ? 'primary.main' : 'inherit',
                }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: activeSection === item.id ? 600 : 400,
                  color: activeSection === item.id ? 'primary.main' : 'inherit',
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              handleOpenCart()
              setIsMenuOpen(false)
            }}
            sx={{
              borderRadius: '24px',
              py: 1,
              boxShadow: 3,
            }}>
            查看购物车
          </Button>
        </Box>
      </Drawer>

      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={handleCloseCart} />
    </>
  )
}

export default Header
