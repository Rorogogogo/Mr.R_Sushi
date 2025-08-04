import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getCartTotal,
} from '../services/cartService'
import CheckoutConfirmationDialog from './CheckoutConfirmationDialog'
import { appEvents } from '../utils/appEvents'

interface AddOnForCart {
  name: string
  price: number
}

type CartItem = {
  id: number
  menuItemId: number
  quantity: number
  menuItem: {
    id: number
    name: string
    price: string
    image?: string
    category?: string
  }
  companions?: string[]
  addOns?: AddOnForCart[]
}

type CartProps = {
  isOpen: boolean
  onClose: () => void
}

const ModernCart = ({ isOpen, onClose }: CartProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Fetch cart items
  const fetchCartItems = async () => {
    setIsLoading(true)
    try {
      const items = await getCartItems()
      setCartItems(items)
      const cartTotal = await getCartTotal()
      setTotal(cartTotal)
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCartItems()
    }
  }, [isOpen])

  useEffect(() => {
    const handleCartUpdate = () => {
      if (isOpen) {
        fetchCartItems()
      }
    }

    appEvents.on('cartUpdated', handleCartUpdate)
    return () => {
      appEvents.off('cartUpdated', handleCartUpdate)
    }
  }, [isOpen])

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(cartItemId)
      return
    }

    try {
      await updateCartItemQuantity(cartItemId, newQuantity)
      await fetchCartItems()
      appEvents.emit('cartUpdated')
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeCartItem(cartItemId)
      await fetchCartItems()
      appEvents.emit('cartUpdated')
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      setCartItems([])
      setTotal(0)
      appEvents.emit('cartUpdated')
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
  }

  const handleCheckoutSuccess = async () => {
    await handleClearCart()
    setIsCheckoutOpen(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-modern-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Cart Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-modern-light shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="glass-card border-b border-modern-beige/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-modern-dark rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-modern-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V7a2 2 0 10-4 0v6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-display font-normal text-modern-dark tracking-wide">
                  您的订单
                </h2>
                <p className="text-sm text-modern-gray">
                  {cartItems.length} 件商品
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center text-modern-gray hover:text-modern-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-modern-dark border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
              <div className="w-16 h-16 bg-modern-cream rounded-3xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-modern-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 7H6l-1-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-modern-dark mb-2">购物车为空</h3>
              <p className="text-modern-gray text-sm mb-6">添加一些美味的寿司开始订餐吧！</p>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                浏览菜单
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="modern-card p-4 group"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-modern-cream flex-shrink-0">
                        <img
                          src={`/images/product_img/${item.menuItem.id}.png`}
                          alt={item.menuItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/product_img/1.png'
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-modern-dark line-clamp-1">
                              {item.menuItem.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-modern-cream text-modern-gray text-xs rounded-full">
                                {item.menuItem.category === 'sushi' ? '寿司' : 
                                 item.menuItem.category === 'handroll' ? '手卷' : '煎饼'}
                              </span>
                              <span className="text-sm font-bold text-accent-gold">
                                ¥{item.menuItem.price}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="w-8 h-8 rounded-xl bg-modern-cream text-modern-gray hover:bg-accent-red hover:text-modern-light transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Add-ons */}
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-modern-gray mb-1">Add-ons:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.addOns.map((addOn, i) => (
                                <span key={i} className="px-2 py-1 bg-accent-gold/10 text-accent-gold text-xs rounded-full">
                                  {addOn.name} (+¥{addOn.price})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-modern-cream rounded-2xl p-1">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-xl bg-modern-light text-modern-gray hover:text-accent-red transition-colors flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-1 text-sm font-bold text-modern-dark min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-xl bg-modern-dark text-modern-light hover:bg-modern-gray transition-colors flex items-center justify-center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-modern-dark">
                              ¥{(parseFloat(item.menuItem.price) * item.quantity + 
                                 (item.addOns?.reduce((sum, addOn) => sum + addOn.price, 0) || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear Cart Button */}
              {cartItems.length > 0 && (
                <div className="pt-4">
                  <button
                    onClick={handleClearCart}
                    className="w-full text-center text-accent-red hover:text-accent-red/80 transition-colors text-sm font-medium"
                  >
                    清空所有商品
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="glass-card border-t border-modern-beige/20 p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-display font-normal text-modern-dark">总计</span>
              <span className="text-2xl font-bold text-modern-dark">¥{total.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <span>确认下单</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <p className="text-xs text-modern-gray text-center">
              最终价格将在餐厅确认
            </p>
          </div>
        )}
      </motion.div>

      {/* Checkout Dialog */}
      <CheckoutConfirmationDialog
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        totalAmount={total}
      />
    </>
      )}
    </AnimatePresence>
  )
}

export default ModernCart