import { useEffect, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import theme from './theme/theme'
import Header from './components/Header'
import CircularGallery from './components/CircularGallery'
import Menu from './components/Menu'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FloatingCart from './components/FloatingCart'
import Cart from './components/Cart'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Add class to body to ensure content is visible under fixed header
  useEffect(() => {
    document.body.classList.add('has-fixed-header')

    // Mark app as loaded after a short delay
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => {
      document.body.classList.remove('has-fixed-header')
      clearTimeout(timer)
    }
  }, [])

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('cart-open')
    } else {
      document.body.classList.remove('cart-open')
    }
  }, [isCartOpen])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: theme.palette.text.primary,
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: theme.palette.success.main,
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: theme.palette.error.main,
              secondary: '#fff',
            },
          },
        }}
      />
      <div
        className={`app-container ${isLoaded ? 'app-loaded' : 'app-loading'}`}>
        <Header setCartOpen={setIsCartOpen} />
        <main className="pt-16">
          {' '}
          {/* Add padding top to account for fixed header */}
          <CircularGallery />
          <Menu />
          <About />
          <Contact />
        </main>
        <Footer />

        {/* Cart components */}
        <FloatingCart onClick={() => setIsCartOpen(true)} />
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </ThemeProvider>
  )
}

export default App
