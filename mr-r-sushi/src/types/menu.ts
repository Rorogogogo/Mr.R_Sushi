export interface MenuItem {
  id: number
  name: string
  price: string
  category: string
  description?: string
  featured?: boolean
  image?: string
  isAvailable?: boolean
}
