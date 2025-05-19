import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Hero = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id="home"
      className={`relative bg-gradient-to-b from-sushi-black to-sushi-neutral overflow-hidden min-h-[100vh] h-auto flex items-center py-16 md:py-0 ${
        scrolled ? 'scrolled' : ''
      }`}>
      {/* Background overlay with modern pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 18c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-10 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm20-6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-10 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}></div>
      </div>

      {/* Abstract shapes for Gen Z aesthetic - simplified */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 bg-sushi-gold/10 rounded-full blur-3xl"
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 w-48 h-48 bg-sushi-red/10 rounded-full blur-3xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container-custom relative z-10 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl mb-12 md:mb-0">
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <span className="block">正宗的</span>
              <span className="text-sushi-gold inline-block animate-pulse-subtle">
                日本
              </span>
              <span className="block">料理</span>
            </motion.h2>

            <motion.p
              className="text-base md:text-lg opacity-90 mb-8 font-light leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}>
              在<span className="font-bold">Mr. R寿司</span>
              体验正宗的日本风味。新鲜的食材，传统的配方，以及温馨的氛围等待着您。
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}>
              <motion.a
                href="#menu"
                className="btn-primary text-center relative overflow-hidden group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                <span className="relative z-10">查看菜单</span>
                <span className="absolute inset-0 bg-gradient-to-r from-sushi-red to-sushi-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </motion.a>

              <motion.a
                href="#contact"
                className="btn bg-transparent backdrop-blur-sm border-2 border-white/80 text-white hover:bg-white hover:text-sushi-black text-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                预约座位
              </motion.a>
            </motion.div>

            <motion.div
              className="mt-10 flex flex-col xs:flex-row xs:items-center gap-4 xs:gap-6 text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}>
              <div className="flex items-center group">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.3 }}
                  className="text-sushi-gold mr-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"></path>
                  </svg>
                </motion.div>
                <span className="group-hover:text-sushi-gold transition-colors">
                  经三路小学向西10米
                </span>
              </div>

              <div className="flex items-center group">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ duration: 0.3 }}
                  className="text-sushi-gold mr-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                  </svg>
                </motion.div>
                <span className="group-hover:text-sushi-gold transition-colors">
                  13203745087
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating Food Image for larger screens - simplified */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden md:block w-full max-w-md relative">
            <div className="relative z-20">
              <div className="rounded-full p-1 backdrop-blur-md bg-gradient-to-br from-white/20 to-white/5 border border-white/10 shadow-xl">
                <div className="aspect-square rounded-full overflow-hidden bg-sushi-black/40">
                  <img
                    src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop"
                    alt="精美寿司拼盘"
                    className="w-full h-full object-cover mix-blend-luminosity opacity-90 hover:mix-blend-normal hover:opacity-100 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Decorative elements - simplified */}
              <div className="absolute -left-6 -bottom-6 w-12 h-12 bg-sushi-gold rounded-full opacity-70 z-10" />
              <div className="absolute -right-4 top-1/3 w-8 h-8 bg-sushi-red rounded-full opacity-60 z-10" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll down indicator - simplified */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white/70 cursor-pointer flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        onClick={() =>
          document
            .getElementById('menu')
            ?.scrollIntoView({ behavior: 'smooth' })
        }>
        <span className="text-xs uppercase tracking-widest mb-2">滚动查看</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
