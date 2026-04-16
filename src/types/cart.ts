export interface CartItem {
  productId: string
  size: string
  quantity: number
}

export interface CartItemWithDetails extends CartItem {
  name: string
  price: number
  image: string
  stock: number
}
