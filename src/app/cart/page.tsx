'use client'

import { useCart } from '@/hooks/useCart'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CartItemWithDetails } from '@/types/cart'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getItemCount } = useCart()
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCartDetails() {
      if (items.length === 0) {
        setCartItems([])
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })

        if (response.ok) {
          const data = await response.json()
          setCartItems(data.items)
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCartDetails()
  }, [items])

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  if (loading) {
    return (
      <main className="cart-page">
        <div className="container cart-layout--reference">
          <p>Загрузка...</p>
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="container cart-layout--reference">
          <div className="panel">
            <h1 className="page-title">Корзина</h1>
            <p className="empty">Ваша корзина пуста</p>
            <Link href="/" className="cta">
              Перейти к покупкам
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <div className="container cart-layout--reference">
        <div className="panel">
          <div className="cart-head">
            <h1 className="page-title">Корзина</h1>
            <Link href="/" className="ghost-btn">
              Продолжить покупки
            </Link>
          </div>

          {cartItems.map((item: any) => (
            <div key={`${item.productId}-${item.size}`} className="cart-row">
              <Link href={`/product/${item.productId}`} className="cart-image-link">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={92}
                  height={118}
                  loading="lazy"
                  quality={80}
                />
              </Link>

              <div>
                <h3 className="item-title">
                  <Link href={`/product/${item.productId}`} className="item-link">
                    {item.name}
                  </Link>
                  <span className="item-size">{item.size}</span>
                </h3>
              </div>

              <div className="qty-cell">
                <label>
                  Количество
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.productId,
                        item.size,
                        parseInt(e.target.value)
                      )
                    }
                  >
                    {Array.from({ length: Math.min(item.stock || 3, 3) }, (_, i) => i + 1).map((n: any) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <strong>{item.price * item.quantity} ₽</strong>

              <button
                className="remove-btn"
                onClick={() => removeItem(item.productId, item.size)}
                aria-label="Удалить"
              >
                ×
              </button>
            </div>
          ))}

          <div className="cart-bottom">
            <div className="cart-checkout">
              <p className="cart-total">{subtotal} ₽</p>
              <div className="cart-checkout-controls">
                <Link href="/checkout" className="cta" id="continueButton">
                  Оформить заказ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
