import { useState, useEffect, useCallback } from 'react'
import {
  getAllCartItemsFromStorage,
  type CartItem,
} from '../services/cartService'

const CART_UPDATED_EVENT = 'cartUpdated'

// Calculates the number of unique line items in the cart
const countLineItems = (items: CartItem[]): number => {
  return items.length
}

// Calculates the total quantity of all items in the cart
// const calculateTotalQuantity = (items: CartItem[]): number => {
//   return items.reduce((total, item) => total + item.quantity, 0)
// }

export const useCartCount = (
  mode: 'lineItems' | 'totalQuantity' = 'totalQuantity'
): number => {
  const [cartCount, setCartCount] = useState<number>(() => {
    const initialItems = getAllCartItemsFromStorage()
    // return mode === 'lineItems' ? countLineItems(initialItems) : calculateTotalQuantity(initialItems)
    // Defaulting to totalQuantity as it was the previous behavior and calculateTotalQuantity is commented out for now
    // Re-enable the line above and uncomment calculateTotalQuantity if mode selection is fully implemented.
    // For now, to match the user request of "length in session cart", we use countLineItems directly.
    return countLineItems(initialItems)
  })

  const handleCartUpdate = useCallback(() => {
    const currentItems = getAllCartItemsFromStorage()
    // setCartCount(mode === 'lineItems' ? countLineItems(currentItems) : calculateTotalQuantity(currentItems))
    // For now, to match the user request of "length in session cart", we use countLineItems directly.
    setCartCount(countLineItems(currentItems))
  }, []) // Removed mode from dependency array as it's not used in the simplified version

  useEffect(() => {
    // Listen for the custom event
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate)

    // Initial check in case the cart was updated before the hook mounted
    handleCartUpdate()

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate)
    }
  }, [handleCartUpdate])

  return cartCount
}
