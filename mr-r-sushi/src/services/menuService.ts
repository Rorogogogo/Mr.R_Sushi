import type { MenuItem } from '../types/menu'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5131/api'

export async function getAllMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_URL}/menu`)

    if (!response.ok) {
      console.error('Fetch error:', response.status, response.statusText)
      const responseText = await response.text()
      console.error('Fetch error response text:', responseText)
      throw new Error('Failed to fetch menu items')
    }

    const data = await response.json()

    if (data.success && data.data) {
      return data.data
    }

    return []
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return []
  }
}

export async function getMenuItemsByCategory(
  category: string
): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_URL}/menu/category/${category}`)

    if (!response.ok) {
      console.error('Fetch error:', response.status, response.statusText)
      const responseText = await response.text()
      console.error('Fetch error response text:', responseText)
      throw new Error(`Failed to fetch ${category} menu items`)
    }

    const data = await response.json()

    if (data.success && data.data) {
      return data.data
    }

    return []
  } catch (error) {
    console.error(`Error fetching ${category} menu items:`, error)
    return []
  }
}

export async function getFeaturedItems(): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_URL}/menu/featured`)

    if (!response.ok) {
      console.error('Fetch error:', response.status, response.statusText)
      const responseText = await response.text()
      console.error('Fetch error response text:', responseText)
      throw new Error('Failed to fetch featured menu items')
    }

    const data = await response.json()

    if (data.success && data.data) {
      return data.data
    }

    return []
  } catch (error) {
    console.error('Error fetching featured menu items:', error)
    return []
  }
}
