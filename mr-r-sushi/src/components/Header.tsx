import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

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

  // Close menu when clicking a link on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen(false)
    }
  }

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('mobile-nav-active')
    } else {
      document.body.classList.remove('mobile-nav-active')
    }

    return () => {
      document.body.classList.remove('mobile-nav-active')
    }
  }, [isMenuOpen])

  // Navigation items
  const navItems = [
    { id: 'home', label: '首页' },
    { id: 'menu', label: '菜单' },
    { id: 'about', label: '关于我们' },
    { id: 'contact', label: '联系方式' },
  ]

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
      <div className="container-custom flex justify-between items-center">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}>
          <a href="#home" className="block">
            <h1
              className={`font-display font-bold transition-all duration-300 ${
                scrolled ? 'text-2xl' : 'text-3xl'
              }`}>
              <span className="text-sushi-red">Mr. R</span>
              <span className="text-sushi-gold">寿司</span>
            </h1>
          </a>
        </motion.div>

        {/* Mobile menu button with animation */}
        <motion.div
          className="md:hidden z-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-10 h-10 relative focus:outline-none ${
              scrolled ? 'text-gray-700' : 'text-black'
            }`}
            aria-label="Menu">
            <div className="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span
                className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                  isMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                }`}></span>
              <span
                className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
              <span
                className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                  isMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                }`}></span>
            </div>
          </button>
        </motion.div>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative">
              <a
                href={`#${item.id}`}
                onClick={handleNavClick}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-colors relative ${
                  activeSection === item.id
                    ? 'text-sushi-red'
                    : scrolled
                    ? 'text-gray-700 hover:text-sushi-red'
                    : 'text-white hover:text-sushi-gold'
                }`}>
                {item.label}
                {activeSection === item.id && (
                  <motion.span
                    layoutId="activeSection"
                    className="absolute inset-0 rounded-full bg-white/10"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}></motion.span>
                )}
              </a>
            </motion.div>
          ))}

          <motion.a
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            href="#contact"
            className={`ml-4 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              scrolled
                ? 'bg-sushi-red text-white border-sushi-red hover:bg-sushi-red/90'
                : 'bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20'
            }`}>
            预约座位
          </motion.a>
        </nav>
      </div>

      {/* Mobile menu with improved animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-sushi-black/95 md:hidden z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center justify-center space-y-6 w-full px-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="w-full">
                  <a
                    href={`#${item.id}`}
                    onClick={handleNavClick}
                    className={`text-2xl font-display font-medium block text-center py-3 w-full border-b border-white/10 ${
                      activeSection === item.id
                        ? 'text-sushi-gold'
                        : 'text-white'
                    }`}>
                    {item.label}
                  </a>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-6 w-full">
                <a
                  href="#contact"
                  onClick={handleNavClick}
                  className="block w-full py-3 text-center bg-sushi-red text-white rounded-lg text-lg">
                  预约座位
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
