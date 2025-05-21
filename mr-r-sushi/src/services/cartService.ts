import type { MenuItem } from '../types/menu'

// Define AddOn type for cart
interface AddOnForCart {
  name: string
  price: number // Use number for price for calculations
}

// Define cart item type
export type CartItem = {
  id: number
  menuItemId: number
  quantity: number
  menuItem: MenuItem
  companions?: string[] // For pancake companions
  addOns?: AddOnForCart[] // For 煎饼 add-ons
  sessionId?: string // Optional: only if needed by frontend logic directly on the item
}

// SessionStorage key for cart
const CART_STORAGE_KEY = 'mr-r-sushi-cart'
const SESSION_ID_KEY = 'mr-r-sushi-session-id'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5131/api'

// Custom event name for cart updates
const CART_UPDATED_EVENT = 'cartUpdated'

// Cache for menu items to reconstruct cart items if server only sends menuItemId
const cartItemCache: { [key: number]: MenuItem } = {}

// Helper to normalize server cart items, especially their AddOns list and menuItem references
const normalizeServerCartItem = (itemFromServer: any): CartItem => {
  const normalizedItem = { ...itemFromServer } as CartItem

  // Normalize addOns if they come with $values
  if (normalizedItem.addOns && (normalizedItem.addOns as any).$values) {
    normalizedItem.addOns = (normalizedItem.addOns as any).$values
  } else if (normalizedItem.addOns && !Array.isArray(normalizedItem.addOns)) {
    console.warn(
      'AddOns received from server is not in expected array format or $values format, clearing:',
      normalizedItem.addOns
    )
    normalizedItem.addOns = []
  }
  if (normalizedItem.addOns == null) {
    normalizedItem.addOns = []
  }

  // Ensure menuItem is fully resolved
  if (
    normalizedItem.menuItem &&
    !(normalizedItem.menuItem as any).$ref &&
    normalizedItem.menuItem.id
  ) {
    // If menuItem is a full object, ensure it's in the cache
    if (!cartItemCache[normalizedItem.menuItem.id]) {
      cartItemCache[normalizedItem.menuItem.id] = normalizedItem.menuItem
    }
  } else if (
    (normalizedItem.menuItem && (normalizedItem.menuItem as any).$ref) ||
    !normalizedItem.menuItem
  ) {
    // If menuItem is a $ref or is missing, try to resolve from cache using menuItemId
    if (normalizedItem.menuItemId && cartItemCache[normalizedItem.menuItemId]) {
      normalizedItem.menuItem = cartItemCache[normalizedItem.menuItemId]
    } else if (normalizedItem.menuItemId) {
      // Only log warning if menuItemId was present but not found in cache
      console.warn(
        `MenuItem with ID ${normalizedItem.menuItemId} referenced by cart item ${normalizedItem.id} was not found in cache.`
      )
      // normalizedItem.menuItem will remain as the $ref or undefined
      // Cart.tsx will need to handle this gracefully
    }
  }
  return normalizedItem
}

const normalizeServerCartItems = (itemsFromServer: any[]): CartItem[] => {
  if (!Array.isArray(itemsFromServer)) return []
  return itemsFromServer.map(normalizeServerCartItem)
}

// Get session ID from sessionStorage or create new one
export function getSessionId() {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)

  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }

  return sessionId
}

// Get all cart items from sessionStorage
export const getAllCartItemsFromStorage = (): CartItem[] => {
  const storedCart = sessionStorage.getItem(CART_STORAGE_KEY)
  if (storedCart) {
    try {
      const parsedItems = JSON.parse(storedCart) as CartItem[]
      return parsedItems.map((item) => {
        const normalizedItem = {
          ...item,
          addOns: Array.isArray(item.addOns) ? item.addOns : [],
          companions: Array.isArray(item.companions) ? item.companions : [],
        } as CartItem
        // Attempt to populate menuItem from cache if it's missing
        if (
          !normalizedItem.menuItem &&
          normalizedItem.menuItemId &&
          cartItemCache[normalizedItem.menuItemId]
        ) {
          normalizedItem.menuItem = cartItemCache[normalizedItem.menuItemId]
        }
        return normalizedItem
      })
    } catch (e) {
      console.error('Error parsing cart from session storage:', e)
      return []
    }
  }
  return []
}

// Save all cart items to sessionStorage
const saveCartItemsToStorage = (items: CartItem[]): void => {
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT)) // Notify listeners
}

// Sync cart item to server (POST request)
const syncCartItemToServer = async (
  sessionId: string,
  menuItemId: number,
  quantity: number,
  addOns?: AddOnForCart[],
  existingServerId?: number // For cases where we might be updating an existing item via POST logic
): Promise<CartItem | null> => {
  try {
    const payload: any = {
      sessionId: sessionId,
      menuItemId: menuItemId,
      quantity: quantity,
      addOns: addOns || [],
    }
    if (existingServerId) {
      payload.id = existingServerId // Backend should handle this as an update if ID is provided
    }

    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(
        'Failed to sync cart item with server. Status:',
        response.status,
        await response.text()
      )
      return null
    }
    const result = await response.json()
    if (result.success && result.data) {
      return normalizeServerCartItem(result.data) // Normalize the single item response
    }
    console.error(
      'Server response error or no data for syncCartItemToServer:',
      result.message
    )
    return null
  } catch (error) {
    console.error('Error syncing cart item to server:', error)
    return null
  }
}

// Fetch cart items from server
const fetchCartItemsFromServer = async (): Promise<CartItem[]> => {
  const sessionId = getSessionId()
  try {
    const response = await fetch(`${API_URL}/cart/${sessionId}`)
    if (!response.ok) {
      console.warn(
        'Failed to fetch cart items from server, status:',
        response.status
      )
      return []
    }
    const result = await response.json()
    if (result.success && result.data) {
      if ((result.data as any).$values) {
        return normalizeServerCartItems((result.data as any).$values)
      }
      if (Array.isArray(result.data)) {
        return normalizeServerCartItems(result.data)
      }
      console.warn(
        'Fetched cart data from server is not in expected array or $values format',
        result.data
      )
      return [] // Return empty if format is unexpected
    }
    return [] // Return empty if result.success is false or no data
  } catch (error) {
    console.error('Error fetching cart items from server:', error)
    return []
  }
}

// Get all cart items - try server first, fall back to sessionStorage
export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const serverItems = await fetchCartItemsFromServer() // Already normalized
    const localItems = getAllCartItemsFromStorage() // Already normalized

    const mergedItemsMap = new Map<number, CartItem>()

    // Add server items to map, they take precedence if IDs match
    serverItems.forEach((item) => {
      if (item.id && Number.isInteger(item.id)) {
        // Ensure it has a valid server ID
        mergedItemsMap.set(item.id, item)
      }
    })

    // Add or update with local items
    localItems.forEach((localItem) => {
      if (localItem.id && mergedItemsMap.has(localItem.id)) {
        // Server version exists, ensure local addOns/companions are considered if server version lacks them
        const serverVersion = mergedItemsMap.get(localItem.id)!
        if (
          (!serverVersion.addOns || serverVersion.addOns.length === 0) &&
          localItem.addOns &&
          localItem.addOns.length > 0
        ) {
          serverVersion.addOns = localItem.addOns
        }
        if (
          (!serverVersion.companions ||
            serverVersion.companions.length === 0) &&
          localItem.companions &&
          localItem.companions.length > 0
        ) {
          serverVersion.companions = localItem.companions
        }
        // Ensure menuItem is populated on the server version if it was missing
        if (!serverVersion.menuItem && localItem.menuItem) {
          serverVersion.menuItem = localItem.menuItem
        }
        mergedItemsMap.set(localItem.id, serverVersion)
      } else if (localItem.id && !Number.isInteger(localItem.id)) {
        // Local item with a temporary ID, doesn't match any server item by ID
        // Check if a similar item (menuItemId + addOns) exists from server to avoid duplicates from failed syncs
        const similarServerItem = serverItems.find(
          (si) =>
            si.menuItemId === localItem.menuItemId &&
            JSON.stringify(si.addOns || []) ===
              JSON.stringify(localItem.addOns || [])
        )
        if (!similarServerItem) {
          mergedItemsMap.set(localItem.id, localItem) // Add as new if no similar server item
        }
      } else if (localItem.id && !mergedItemsMap.has(localItem.id)) {
        // Local item with what looks like a server ID but wasn't in server fetch (e.g. added then server cleared)
        mergedItemsMap.set(localItem.id, localItem)
      }
    })

    const finalMergedItems = Array.from(mergedItemsMap.values())
    saveCartItemsToStorage(finalMergedItems)
    return finalMergedItems
  } catch (error) {
    console.error('Error in getCartItems during merge:', error)
    return getAllCartItemsFromStorage() // Fallback to purely local storage
  }
}

// Add item to cart
export const addToCart = async (
  menuItem: MenuItem,
  quantity: number,
  companions?: string[],
  addOns?: AddOnForCart[]
): Promise<CartItem | null> => {
  if (menuItem && menuItem.id) {
    cartItemCache[menuItem.id] = menuItem
  }

  let currentCartItems = await getCartItems() // Start with the most accurate merged list
  const sessionId = getSessionId()
  const itemsToRemoveServerSide: number[] = []

  if (menuItem.name === '煎饼') {
    const otherJianbingInstances = currentCartItems.filter(
      (item) =>
        item.menuItemId === menuItem.id &&
        JSON.stringify(item.addOns || []) !== JSON.stringify(addOns || [])
    )
    otherJianbingInstances.forEach((item) => {
      if (item.id && Number.isInteger(item.id) && item.id > 0) {
        itemsToRemoveServerSide.push(item.id)
      }
    })
    currentCartItems = currentCartItems.filter(
      (item) =>
        !(
          item.menuItemId === menuItem.id &&
          JSON.stringify(item.addOns || []) !== JSON.stringify(addOns || [])
        )
    )
  }

  const existingItemIndex = currentCartItems.findIndex(
    (item) =>
      item.menuItemId === menuItem.id &&
      JSON.stringify(item.companions || []) ===
        JSON.stringify(companions || []) &&
      JSON.stringify(item.addOns || []) === JSON.stringify(addOns || [])
  )

  let itemToReturn: CartItem | null = null

  if (existingItemIndex !== -1) {
    const existingItem = currentCartItems[existingItemIndex]
    existingItem.quantity += quantity

    if (existingItem.quantity <= 0) {
      const removedItemId = existingItem.id
      currentCartItems.splice(existingItemIndex, 1)
      if (
        removedItemId &&
        Number.isInteger(removedItemId) &&
        removedItemId > 0
      ) {
        itemsToRemoveServerSide.push(removedItemId)
      }
      itemToReturn = null
    } else {
      saveCartItemsToStorage(currentCartItems) // Optimistic save
      if (
        existingItem.id &&
        Number.isInteger(existingItem.id) &&
        existingItem.id > 0
      ) {
        const updateSuccess = await updateCartItemQuantity(
          existingItem.id,
          existingItem.quantity
        )
        itemToReturn = updateSuccess ? existingItem : { ...existingItem } // Return local if server fails
      } else {
        // Item exists locally but not on server or has temp ID, try full sync
        const syncedItem = await syncCartItemToServer(
          sessionId,
          existingItem.menuItemId,
          existingItem.quantity,
          existingItem.addOns,
          undefined
        )
        if (syncedItem) {
          currentCartItems[existingItemIndex] = syncedItem
          itemToReturn = syncedItem
        } else {
          itemToReturn = existingItem // Sync failed, keep local version
        }
      }
    }
  } else if (quantity > 0) {
    const tempId = Date.now() + Math.random()
    const newItem: CartItem = {
      id: tempId,
      menuItemId: menuItem.id,
      quantity,
      menuItem,
      companions,
      addOns,
    }
    currentCartItems.push(newItem)
    saveCartItemsToStorage(currentCartItems) // Optimistic save

    const syncedItem = await syncCartItemToServer(
      sessionId,
      menuItem.id,
      quantity,
      addOns
    )
    const itemIndexInStorage = currentCartItems.findIndex(
      (i) => i.id === tempId
    )
    if (syncedItem) {
      if (itemIndexInStorage !== -1) {
        currentCartItems[itemIndexInStorage] = syncedItem
      } else {
        currentCartItems.push(syncedItem) // Should be rare
      }
      itemToReturn = syncedItem
    } else {
      itemToReturn = newItem // Sync failed, keep local item with temp ID
    }
  }

  saveCartItemsToStorage(currentCartItems) // Final save after all operations

  for (const itemId of itemsToRemoveServerSide) {
    if (typeof itemId === 'number' && itemId > 0) {
      fetch(`${API_URL}/cart/item/${itemId}`, { method: 'DELETE' }).catch(
        (err) => console.error('Error removing item from server:', err)
      )
    }
  }
  return itemToReturn
}

// Update cart item quantity
export const updateCartItemQuantity = async (
  id: number, // SERVER ID
  quantity: number
): Promise<boolean> => {
  if (!(Number.isInteger(id) && id > 0)) {
    console.error('updateCartItemQuantity: Invalid server ID provided.', id)
    return false
  }
  try {
    const response = await fetch(`${API_URL}/cart/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: quantity }),
    })
    if (!response.ok) {
      console.error(
        'Failed to update cart item quantity on server. Status:',
        response.status,
        await response.text()
      )
      return false
    }
    // Assuming the server doesn't return the full item on PUT, just success/failure
    // The local cart should already be updated optimistically or via getCartItems before this is called typically
    // Or, if server returns updated item, we could use normalizeServerCartItem and update sessionStorage here.
    return true
  } catch (error) {
    console.error('Error updating cart item on server:', error)
    return false
  }
}

// Remove item from cart
export const removeCartItem = async (id: number): Promise<void> => {
  let currentCartItems = getAllCartItemsFromStorage()
  currentCartItems = currentCartItems.filter((item) => item.id !== id)
  saveCartItemsToStorage(currentCartItems)

  if (Number.isInteger(id) && id > 0) {
    // If it's a server ID
    try {
      const response = await fetch(`${API_URL}/cart/item/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        console.error(
          'Failed to remove cart item from server. Status:',
          response.status
        )
        // Consider re-adding to local storage or notifying user if critical
      }
    } catch (error) {
      console.error('Error removing cart item from server:', error)
    }
  }
}

// Clear cart
export const clearCart = async (): Promise<void> => {
  saveCartItemsToStorage([]) // Clear local first
  const sessionId = getSessionId()
  try {
    const response = await fetch(`${API_URL}/cart/${sessionId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      console.error('Failed to clear cart on server. Status:', response.status)
    }
  } catch (error) {
    console.error('Error clearing cart on server:', error)
  }
}

// Send cart to backend for checkout (only called when checkout is requested)
export const checkoutCart = async (): Promise<void> => {
  const cartItems = getAllCartItemsFromStorage()
  if (cartItems.length === 0) throw new Error('购物车为空')

  const sessionId = getSessionId()
  // We send the locally an up-to-date cart to checkout, assuming local is source of truth for this action
  const response = await fetch(`${API_URL}/cart/${sessionId}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // The backend OrderCheckoutDto should match what the frontend sends here.
    // Crucially, it should be able to reconstruct the order based on this payload.
    // If the backend relies *only* on its DB state for cart items at checkout, then addOns might be lost
    // if not perfectly synced. Sending the full desired cartItems here is safer.
    body: JSON.stringify(cartItems),
  })

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: '结账失败，请重试' }))
    throw new Error(errorData.message || '结账失败，请重试')
  }
  saveCartItemsToStorage([]) // Clear cart on successful checkout
}

// Get total price of cart items
export const getCartTotal = (): number => {
  const cartItems = getAllCartItemsFromStorage()
  let total = 0

  cartItems.forEach((item) => {
    if (item.menuItem && item.menuItem.price) {
      try {
        const itemPrice = parseFloat(
          String(item.menuItem.price).replace('元', '')
        )
        if (!isNaN(itemPrice)) {
          total += itemPrice * item.quantity
        }
      } catch (e) {
        console.error('Error parsing item price:', item.menuItem.price, e)
      }
    }
    if (item.addOns) {
      item.addOns.forEach((addOn) => {
        total += addOn.price * item.quantity
      })
    }
  })

  return total
}
