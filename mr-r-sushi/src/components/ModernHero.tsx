import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const ModernHero = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen bg-modern-dark overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Sushi Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-modern-dark/90" />
      </div>

      {/* Top Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 p-6"
      >
        <div className="container-custom flex items-center justify-between">
          {/* Hamburger Menu */}
          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-3 rounded-2xl">
              <div className="flex flex-col gap-1">
                <div className="w-5 h-0.5 bg-modern-light rounded"></div>
                <div className="w-5 h-0.5 bg-modern-light rounded"></div>
                <div className="w-5 h-0.5 bg-modern-light rounded"></div>
              </div>
            </div>
            
            {/* Logo */}
            <div className="text-2xl font-display font-normal text-modern-light tracking-wider">
              MR. R 寿司
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#menu" className="text-modern-light/80 hover:text-modern-light transition-colors text-sm font-medium tracking-wide uppercase">Menu</a>
            <a href="#about" className="text-modern-light/80 hover:text-modern-light transition-colors text-sm font-medium tracking-wide uppercase">About</a>
            <a href="#contact" className="glass-card px-6 py-3 rounded-2xl text-modern-light text-sm font-medium tracking-wide uppercase hover:bg-modern-light/10 transition-colors">
              Book a Table
            </a>
            
            {/* Cart Icon for Desktop */}
            <button 
              onClick={() => {
                // This will be handled by the App component's cart state
                const cartEvent = new CustomEvent('openCart');
                window.dispatchEvent(cartEvent);
              }}
              className="glass-card p-3 rounded-2xl text-modern-light hover:bg-modern-light/10 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V7a2 2 0 10-4 0v6" />
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 container-custom grid lg:grid-cols-2 gap-16 items-center min-h-[80vh] px-6">
        {/* Left Side - Typography */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 rounded-full glass-card text-accent-gold text-sm font-medium tracking-wide"
          >
            <span className="w-2 h-2 bg-accent-gold rounded-full mr-3 animate-pulse" />
            正宗日式料理
          </motion.div>

          {/* Large Heading - Qitchen Style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-normal text-modern-light leading-[0.85] tracking-tight uppercase">
              SUSHI
              <br />
              <span className="text-accent-gold">SENSATION</span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-modern-light/70 leading-relaxed max-w-lg font-light"
          >
            体验传统日式风味与现代创新的美妙结合。新鲜食材，精湛工艺，为您呈现极致美味。
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <motion.a
              href="#menu"
              className="inline-flex items-center text-modern-light/80 hover:text-accent-gold transition-colors text-sm font-medium tracking-wide uppercase group"
              whileHover={{ x: 5 }}
            >
              <span>浏览菜单</span>
              <svg 
                className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
            
            <motion.a
              href="#contact"
              className="inline-flex items-center text-modern-light/80 hover:text-accent-gold transition-colors text-sm font-medium tracking-wide uppercase group"
              whileHover={{ x: 5 }}
            >
              <span>预约座位</span>
              <svg 
                className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col gap-3 pt-8 text-modern-light/60 text-sm"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              经三路小学向西10米
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              13203745087
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex gap-3">
              <a 
                href="/qrcode/Wechat_account.jpg" 
                target="_blank"
                className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-modern-light/60 hover:text-accent-gold transition-colors"
              >
                💬
              </a>
              <a 
                href="/qrcode/Wechat_pay.jpg"
                target="_blank" 
                className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-modern-light/60 hover:text-accent-gold transition-colors"
              >
                💳
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Image Cards */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="hidden lg:flex flex-col gap-6 h-full"
        >
          {/* Menu Card */}
          <motion.a
            href="#menu"
            className="group relative overflow-hidden rounded-3xl h-64 glass-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
              alt="Our Menu"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-modern-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-normal text-modern-light uppercase tracking-wide">
                  Menu
                </h3>
                <div className="w-12 h-12 glass-card rounded-full flex items-center justify-center text-modern-light">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.a>

          {/* Reservation Card */}
          <motion.a
            href="#contact"
            className="group relative overflow-hidden rounded-3xl h-48 glass-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
              alt="Reservation"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-modern-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-normal text-modern-light uppercase tracking-wide">
                  Reservation
                </h3>
                <div className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-modern-light">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.a>

          {/* About Card */}
          <motion.a
            href="#about"
            className="group relative overflow-hidden rounded-3xl h-48 glass-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3"
              alt="Our Restaurant"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-modern-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-normal text-modern-light uppercase tracking-wide">
                  Our Restaurant
                </h3>
                <div className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-modern-light">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-modern-light/40 cursor-pointer z-10"
        onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-xs uppercase tracking-widest mb-3 font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-5"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default ModernHero