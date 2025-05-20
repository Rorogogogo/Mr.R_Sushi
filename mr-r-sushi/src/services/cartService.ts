import type { MenuItem } from '../types/menu'

// Define cart item type
export type CartItem = {
  id: number
  menuItemId: number
  quantity: number
  menuItem: MenuItem
  companions?: string[] // For pancake companions
}

// LocalStorage key for cart
const CART_STORAGE_KEY = 'mr-r-sushi-cart'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5131/api'

// Get session ID from local storage or create new one
export function getSessionId() {
  let sessionId = localStorage.getItem('sessionId')

  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15)
    localStorage.setItem('sessionId', sessionId)
  }

  return sessionId
}

// Get a unique ID for new cart items
const getNextCartItemId = (): number => {
  const cartItems = getAllCartItemsFromStorage()
  return cartItems.length > 0
    ? Math.max(...cartItems.map((item) => item.id)) + 1
    : 1
}

// Get all cart items from localStorage
const getAllCartItemsFromStorage = (): CartItem[] => {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY)
  return storedCart ? JSON.parse(storedCart) : []
}

// Save all cart items to localStorage
const saveCartItemsToStorage = (items: CartItem[]): void => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

// Get all cart items
export const getCartItems = async (): Promise<CartItem[]> => {
  return Promise.resolve(getAllCartItemsFromStorage())
}

// Add item to cart
export const addToCart = async (
  menuItem: MenuItem,
  quantity: number,
  companions?: string[]
): Promise<CartItem> => {
  const cartItems = getAllCartItemsFromStorage()

  // Check if item already exists in cart (matching menuItemId and companions if applicable)
  const existingItemIndex = cartItems.findIndex(
    (item) =>
      item.menuItemId === menuItem.id &&
      JSON.stringify(item.companions || []) === JSON.stringify(companions || [])
  )

  if (existingItemIndex !== -1) {
    // Update quantity of existing item
    cartItems[existingItemIndex].quantity += quantity
    saveCartItemsToStorage(cartItems)
    return cartItems[existingItemIndex]
  } else {
    // Add new item
    const newCartItem: CartItem = {
      id: getNextCartItemId(),
      menuItemId: menuItem.id,
      quantity,
      menuItem,
      companions,
    }
    cartItems.push(newCartItem)
    saveCartItemsToStorage(cartItems)
    return newCartItem
  }
}

// Update cart item quantity
export const updateCartItemQuantity = async (
  id: number,
  quantity: number
): Promise<CartItem> => {
  const cartItems = getAllCartItemsFromStorage()
  const itemIndex = cartItems.findIndex((item) => item.id === id)

  if (itemIndex === -1) {
    throw new Error('Cart item not found')
  }

  cartItems[itemIndex].quantity = quantity
  saveCartItemsToStorage(cartItems)
  return cartItems[itemIndex]
}

// Remove item from cart
export const removeCartItem = async (id: number): Promise<void> => {
  const cartItems = getAllCartItemsFromStorage()
  const updatedItems = cartItems.filter((item) => item.id !== id)
  saveCartItemsToStorage(updatedItems)
  return Promise.resolve()
}

// Clear cart
export const clearCart = async (): Promise<void> => {
  saveCartItemsToStorage([])
  return Promise.resolve()
}

// Send cart to backend for checkout (only called when checkout is requested)
export const checkoutCart = async (): Promise<void> => {
  const cartItems = getAllCartItemsFromStorage()

  // If cart is empty, throw error
  if (cartItems.length === 0) {
    throw new Error('购物车为空')
  }

  try {
    // Send the cart to the backend
    const sessionId = getSessionId()
    const response = await fetch(`${API_URL}/cart/${sessionId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartItems),
    })

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.message || '结账失败，请重试'
      throw new Error(errorMessage)
    }

    // Clear the cart after successful checkout
    saveCartItemsToStorage([])
    return Promise.resolve()
  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('结账失败，请重试')
    }
  }
}

// Calculate total price of cart
export const getCartTotal = (): number => {
  const cartItems = getAllCartItemsFromStorage()
  return cartItems.reduce((total, item) => {
    // Remove '元' from price and convert to number
    const itemPrice = parseFloat(item.menuItem.price.replace('元', ''))

    // Add companion prices if any
    let companionPriceTotal = 0
    if (item.companions && item.companions.length > 0) {
      const companionPrices = {
        加海苔: 3,
        加肉松: 4,
        加火腿肉: 6,
        加培根: 7,
      }

      item.companions.forEach((companion) => {
        if (companion in companionPrices) {
          companionPriceTotal +=
            companionPrices[companion as keyof typeof companionPrices]
        }
      })
    }

    return total + (itemPrice + companionPriceTotal) * item.quantity
  }, 0)
}
