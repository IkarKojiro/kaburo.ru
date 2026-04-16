export interface Product {
  id: string
  name: string
  category: string | null
  price: number
  description: string | null
  sizes: string[]
  stock: Record<string, number>
  colors: string[]
  images: string[]
  isNew: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductCreateInput {
  id: string
  name: string
  category?: string
  price: number
  description?: string
  sizes: string[]
  stock: Record<string, number>
  colors: string[]
  images: string[]
  isNew?: boolean
}
