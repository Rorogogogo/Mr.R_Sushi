import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MenuItem {
  name: string
  price: string
  category: 'sushi' | 'handroll'
  description?: string
  featured?: boolean
  image?: string
}

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'sushi' | 'handroll'
  >('all')
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Fallback image for when an image fails to load
  const fallbackImageUrl =
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=300&auto=format&fit=crop'

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImageUrl
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const menuItems: MenuItem[] = [
    // Sushi items with added descriptions and featured status
    {
      name: '招牌寿司',
      price: '13元',
      category: 'sushi',
      description:
        'Signature sushi with fresh ingredients and our special sauce',
      featured: true,
      image: '/images/sushi-signature.jpg',
    },
    {
      name: '鸭蛋黄寿司',
      price: '15元',
      category: 'sushi',
      description: 'Duck egg yolk sushi with rich flavor profile',
      image: '/images/sushi-duck.jpg',
    },
    {
      name: '培根寿司',
      price: '15元',
      category: 'sushi',
      description: 'Crispy bacon sushi fusion dish',
    },
    {
      name: '樱花寿司',
      price: '15元',
      category: 'sushi',
      description: 'Cherry blossom inspired sushi with seasonal flavors',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1556906782-5e232862b21e?q=80&w=300&auto=format&fit=crop',
    },
    {
      name: '芝士寿司',
      price: '16元',
      category: 'sushi',
      description: 'Cheese sushi with a perfect blend of flavors',
    },
    {
      name: '鱼子酱寿司',
      price: '16元',
      category: 'sushi',
      description: 'Premium fish roe sushi with exquisite taste',
    },
    {
      name: '金枪鱼寿司',
      price: '18元',
      category: 'sushi',
      description: 'Fresh tuna sushi, a classic favorite',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1558985250-27a406d64cb3?q=80&w=300&auto=format&fit=crop',
    },
    {
      name: '金枪鱼鱼子酱寿司',
      price: '20元',
      category: 'sushi',
      description: 'Tuna with fish roe sushi, rich in flavor',
    },
    {
      name: '金枪鱼鹌鹑蛋芝士寿司',
      price: '22元',
      category: 'sushi',
      description: 'Tuna with quail egg and cheese sushi, premium taste',
    },
    {
      name: '金枪鱼鹌鹑蛋芝士+鸭蛋黄寿司',
      price: '24元',
      category: 'sushi',
      description: 'Tuna with quail egg, cheese and duck egg yolk sushi',
    },
    {
      name: '金枪鱼鹌鹑蛋芝士+鸭蛋黄+培根寿司',
      price: '26元',
      category: 'sushi',
      description:
        'Our ultimate tuna combination sushi with all premium toppings',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=300&auto=format&fit=crop',
    },

    // Hand roll items with descriptions
    {
      name: '肉松手卷',
      price: '7元',
      category: 'handroll',
      description: 'Meat floss hand roll with savory flavor',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=300&auto=format&fit=crop',
    },
    {
      name: '火腿手卷',
      price: '7元',
      category: 'handroll',
      description: 'Ham hand roll, a perfect quick bite',
    },
    {
      name: '鱼子手卷',
      price: '7元',
      category: 'handroll',
      description: 'Fish roe hand roll with premium roe',
    },
    {
      name: '蟹棒手卷',
      price: '7元',
      category: 'handroll',
      description: 'Crab stick hand roll, a classic choice',
      featured: true,
      image:
        'https://images.unsplash.com/photo-1540713304937-18ad930d3594?q=80&w=300&auto=format&fit=crop',
    },
    {
      name: '芝士手卷',
      price: '7元',
      category: 'handroll',
      description: 'Cheese hand roll with a creamy texture',
    },
  ]

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  const featuredItems = menuItems.filter((item) => item.featured)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  const categories = [
    { id: 'all', label: '全部菜单' },
    { id: 'sushi', label: '寿司' },
    { id: 'handroll', label: '手卷' },
  ]

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sushi-gold via-sushi-red to-sushi-gold"></div>

      <motion.div
        className="absolute -right-24 top-40 w-48 h-48 rounded-full bg-sushi-gold/5 blur-3xl"
        animate={{
          scale: isInView ? [0.8, 1.2, 0.8] : 0.8,
          opacity: isInView ? [0.3, 0.6, 0.3] : 0.3,
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -left-24 bottom-40 w-64 h-64 rounded-full bg-sushi-red/5 blur-3xl"
        animate={{
          scale: isInView ? [0.7, 1, 0.7] : 0.7,
          opacity: isInView ? [0.2, 0.4, 0.2] : 0.2,
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <div className="container-custom relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}>
          <h2 className="section-heading">
            <span className="relative inline-block">
              我们的
              <span className="heading-accent"> 菜单</span>
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-sushi-gold/70"
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}></motion.span>
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mobile-friendly-text">
            发现我们精选的使用最优质食材新鲜制作的寿司。每一份都精心制作，为您带来正宗的日本风味。
          </p>

          {/* Featured items Carousel for mobile */}
          <div className="mt-10 mb-8 overflow-hidden md:hidden">
            <h3 className="text-xl font-display font-medium mb-4 text-sushi-black">
              特色菜品
            </h3>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x scrollbar-hide">
              {featuredItems.map((item, index) => (
                <div
                  key={`featured-${index}`}
                  className="min-w-[85vw] xs:min-w-[250px] snap-center flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-white">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={item.image || fallbackImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-medium">{item.name}</h4>
                      <span className="text-lg font-bold text-sushi-red">
                        {item.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex justify-center flex-wrap mt-8 gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`px-5 py-2 rounded-full text-sm font-medium border relative overflow-hidden
                  ${
                    activeCategory === category.id
                      ? 'text-white border-sushi-red'
                      : 'text-gray-700 border-gray-200 hover:border-gray-300'
                  } transition-all duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <span className="relative z-10">{category.label}</span>
                {activeCategory === category.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-sushi-red to-sushi-accent"
                    layoutId="activeCategoryBg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((menuItem, index) => (
                <motion.div
                  key={`${activeCategory}-${index}`}
                  variants={item}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 border border-gray-100 h-full">
                  {menuItem.image && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={menuItem.image}
                        alt={menuItem.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-sushi-black">
                        {menuItem.name}
                        <span className="block text-sm font-normal text-gray-500 mt-1">
                          {menuItem.category === 'sushi'
                            ? '寿司 / Sushi'
                            : '手卷 / Hand Roll'}
                        </span>
                      </h3>
                      <div className="text-lg font-bold min-w-14 text-right">
                        <span className="text-sushi-accent">
                          {menuItem.price}
                        </span>
                      </div>
                    </div>
                    {menuItem.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {menuItem.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            menuItem.category === 'sushi'
                              ? 'bg-sushi-gold/10 text-sushi-gold'
                              : 'bg-sushi-red/10 text-sushi-red'
                          }`}>
                          {menuItem.category === 'sushi' ? '寿司' : '手卷'}
                        </span>
                        {menuItem.featured && (
                          <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            特色
                          </span>
                        )}
                      </div>
                      <button className="text-sm text-sushi-gold hover:text-sushi-red transition-colors">
                        <span className="font-medium">+</span> 添加
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* View all link */}
        <div className="text-center mt-12">
          <motion.a
            href="#contact"
            className="inline-flex items-center text-sushi-red hover:text-sushi-gold transition-colors"
            whileHover={{ x: 5 }}>
            查看完整菜单
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.a>
        </div>
      </div>
    </section>
  )
}

export default Menu
