import type { MenuItem } from '../types/menu'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5131/api'

// Define a type for the API response that includes the $values structure
interface ApiResponse<T> {
  success: boolean
  data: T[] | { $id: string; $values: T[] }
  message?: string
  totalCount?: number
}

export async function getAllMenuItems(): Promise<ApiResponse<MenuItem>> {
  try {
    const response = await fetch(`${API_URL}/menu`)

    if (!response.ok) {
      console.error('Fetch error:', response.status, response.statusText)
      const responseText = await response.text()
      console.error('Fetch error response text:', responseText)
      throw new Error('Failed to fetch menu items')
    }
    // Return the full response object now, not just data.data
    return (await response.json()) as ApiResponse<MenuItem>
  } catch (error) {
    console.error('Error fetching menu items:', error)
    // Return a default error structure or rethrow
    return { success: false, data: [], message: (error as Error).message }
  }
}

export async function getMenuItemsByCategory(
  category: string
): Promise<ApiResponse<MenuItem>> {
  try {
    const response = await fetch(`${API_URL}/menu/category/${category}`)

    if (!response.ok) {
      console.error('Fetch error:', response.status, response.statusText)
      const responseText = await response.text()
      console.error('Fetch error response text:', responseText)
      throw new Error(`Failed to fetch ${category} menu items`)
    }

    return (await response.json()) as ApiResponse<MenuItem>
  } catch (error) {
    console.error(`Error fetching ${category} menu items:`, error)
    return { success: false, data: [], message: (error as Error).message }
  }
}

export async function getFeaturedItems(): Promise<ApiResponse<MenuItem>> {
  try {
    const response = await fetch(`${API_URL}/menu/featured`)

    if (!response.ok) {
      console.error('Fetch error:', response.status, response.statusText)
      const responseText = await response.text()
      console.error('Fetch error response text:', responseText)
      throw new Error('Failed to fetch featured menu items')
    }

    return (await response.json()) as ApiResponse<MenuItem>
  } catch (error) {
    console.error('Error fetching featured menu items:', error)
    return { success: false, data: [], message: (error as Error).message }
  }
}
