import { useState, useEffect } from 'react'
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

const ModernMenu = () => {
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

  const fallbackImageUrl = '/images/product_img/1.png'

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = fallbackImageUrl
  }

  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true)
      try {
        const response = await fetchAllMenuItems()
        if (isDataWithValues(response.data)) {
          setMenuItems(response.data.$values)
        } else if (Array.isArray(response.data)) {
          setMenuItems(response.data)
        } else {
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

  useEffect(() => {
    if (menuItems.length > 0) {
      const persistedCartItems = getAllCartItemsFromStorage()
      const initialQuantities: Record<
        number,
        { cartItemId: number; quantity: number }
      > = {}
      persistedCartItems.forEach((cartItem) => {
        const menuItemExists = menuItems.find(
          (mi) => mi.id === cartItem.menuItemId
        )
        if (menuItemExists) {
          initialQuantities[cartItem.menuItemId] = {
            cartItemId: cartItem.id,
            quantity: cartItem.quantity,
          }
        }
      })
      setItemQuantities(initialQuantities)
    }
  }, [menuItems])

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
  }, [])

  const filteredItems =
    activeCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

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

    setItemQuantities((prev) => ({
      ...prev,
      [menuItem.id]: {
        cartItemId: cartItemId || menuItem.id,
        quantity: newQuantity,
      },
    }))

    try {
      if (cartItemId && currentQuantity > 0) {
        await updateCartItemQuantity(cartItemId, newQuantity)
      } else {
        const result = await addToCart(menuItem, 1)
        if (result && result.id) {
          cartItemId = result.id
          setItemQuantities((prev) => ({
            ...prev,
            [menuItem.id]: { ...prev[menuItem.id], cartItemId: cartItemId! },
          }))
        }
      }

      if (cartItemId) {
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
      setItemQuantities((prev) => {
        const revertedQtys = { ...prev }
        if (currentQuantity === 0) {
          delete revertedQtys[menuItem.id]
        } else if (cartItemId) {
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

  const handleRemoveFromCart = async (menuItem: MenuItem) => {
    const existingQuantityInfo = itemQuantities[menuItem.id]
    if (!existingQuantityInfo || existingQuantityInfo.quantity <= 0) return

    const originalQuantity = existingQuantityInfo.quantity
    const cartItemId = existingQuantityInfo.cartItemId
    const newQuantity = originalQuantity - 1

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
      setItemQuantities((prev) => ({
        ...prev,
        [menuItem.id]: { cartItemId, quantity: originalQuantity },
      }))
      appEvents.emit('cartUpdated')
    }
  }

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

  const categories = [
    { id: 'all', label: '全部菜单', icon: '🍽️' },
    { id: 'sushi', label: '寿司', icon: '🍣' },
    { id: 'handroll', label: '手卷', icon: '🍙' },
    { id: 'pancake', label: '煎饼', icon: '🥞' },
  ]

  if (isLoading) {
    return (
      <section className="py-20 bg-modern-light">
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="h-8 bg-modern-beige rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-modern-beige rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="modern-card animate-pulse">
                <div className="h-48 bg-modern-beige rounded-2xl mb-6" />
                <div className="h-6 bg-modern-beige rounded w-3/4 mb-3" />
                <div className="h-4 bg-modern-beige rounded w-full mb-2" />
                <div className="h-4 bg-modern-beige rounded w-2/3 mb-6" />
                <div className="h-12 bg-modern-beige rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="menu" className="py-20 bg-modern-light">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-heading">我们的菜单</h2>
          <p className="text-lg text-modern-gray max-w-2xl mx-auto font-light leading-relaxed">
            发现我们精选的使用最优质食材新鲜制作的美食。每一份都精心制作，为您带来美妙的味觉体验。
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as any)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-modern-dark text-modern-light shadow-lg'
                  : 'bg-modern-cream text-modern-gray hover:bg-modern-beige'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Menu Grid */}
        <div
          key={activeCategory}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in"
        >
          {filteredItems.map((menuItem, index) => (
            <motion.div
              key={menuItem.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
              viewport={{ once: true }}
              className="modern-card group"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-2xl mb-6 gpu-accelerated">
                <img
                  src={`/images/product_img/${menuItem.id}.png`}
                  alt={menuItem.name}
                  onError={handleImageError}
                  loading="lazy"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 gpu-accelerated"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 gpu-accelerated">
                  <span className="px-3 py-1 bg-modern-dark/70 text-modern-light text-xs font-medium rounded-full">
                    {menuItem.category === 'sushi'
                      ? '寿司'
                      : menuItem.category === 'handroll'
                      ? '手卷' 
                      : '煎饼'}
                  </span>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4 gpu-accelerated">
                  <span className="px-3 py-1 bg-accent-gold text-modern-dark text-sm font-bold rounded-full">
                    ¥{menuItem.price}
                  </span>
                </div>

                {/* Featured Badge */}
                {menuItem.featured && (
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-accent-red text-modern-light text-xs font-medium rounded-full flex items-center">
                      <span className="w-2 h-2 bg-modern-light rounded-full mr-2 animate-pulse" />
                      人气推荐
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-modern-dark leading-tight">
                  {menuItem.name}
                </h3>
                
                <p className="text-modern-gray text-sm leading-relaxed line-clamp-2">
                  {menuItem.description}
                </p>

                {/* Add to Cart Button */}
                <AnimatePresence mode="wait">
                  {!itemQuantities[menuItem.id] ? (
                    <motion.button
                      key="add-btn"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleAddToCart(menuItem)}
                      disabled={isAddingToCart[menuItem.id]}
                      className="w-full btn-primary flex items-center justify-center"
                    >
                      {isAddingToCart[menuItem.id] ? (
                        <div className="w-5 h-5 border-2 border-modern-light border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V7a2 2 0 10-4 0v6" />
                          </svg>
                          预定
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.div
                      key="quantity-control"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between bg-modern-cream rounded-2xl p-2"
                    >
                      <button
                        onClick={() => handleRemoveFromCart(menuItem)}
                        className="w-10 h-10 bg-modern-light rounded-xl flex items-center justify-center text-modern-gray hover:text-accent-red transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <span className="text-lg font-bold text-modern-dark px-4">
                        {itemQuantities[menuItem.id]?.quantity || 0}
                      </span>
                      
                      <button
                        onClick={() => handleAddToCart(menuItem)}
                        className="w-10 h-10 bg-modern-dark rounded-xl flex items-center justify-center text-modern-light hover:bg-modern-gray transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="#contact"
            className="btn-outline"
          >
            查看完整菜单
          </a>
        </motion.div>
      </div>

      {/* Companion Selection Dialog */}
      <CompanionSelectionDialog
        open={companionDialogOpen}
        onClose={() => setCompanionDialogOpen(false)}
        onAddToCart={handleAddPancakeWithCompanions}
        menuItem={selectedMenuItem}
      />
    </section>
  )
}

export default ModernMenu