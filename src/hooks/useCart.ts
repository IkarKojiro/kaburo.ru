'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types/cart'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.size === item.size
          )

          if (existingIndex >= 0) {
            const newItems = [...state.items]
            newItems[existingIndex].quantity += item.quantity
            return { items: newItems }
          }

          return { items: [...state.items, item] }
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        })),

      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'kaburo-cart',
    }
  )
)
