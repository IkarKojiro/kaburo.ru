'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { CartItemWithDetails } from '@/types/cart'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    shippingType: 'cdek_pvz',
    fullName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    comment: '',
    promoCode: '',
    paymentMethod: 'card_ru',
    consent: false,
  })

  useEffect(() => {
    async function loadCartDetails() {
      if (items.length === 0) {
        router.push('/cart')
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
  }, [items, router])

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const shipping = formData.shippingType === 'cdek_pvz' ? 600 : 0
  const discount = 0
  const total = subtotal + shipping - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.consent) {
      setError('Необходимо согласие на обработку персональных данных')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
          },
          delivery: {
            shippingType: formData.shippingType,
            city: formData.city,
            address: formData.address,
          },
          paymentMethod: formData.paymentMethod,
          comment: formData.comment || undefined,
          promoCode: formData.promoCode || undefined,
          consentAccepted: formData.consent,
          items: items.map((item: any) => {
            const product = cartItems.find((p: any) => p.productId === item.productId)
            return {
              productId: item.productId,
              name: product?.name || '',
              size: item.size,
              quantity: item.quantity,
              unitPrice: product?.price || 0,
            }
          }),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        clearCart()
        window.location.href = data.paymentUrl
      } else {
        setError(data.error || 'Ошибка создания заказа')
      }
    } catch (error) {
      setError('Ошибка соединения с сервером')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <div className="container">
          <p>Загрузка...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <section className="container checkout-layout">
        <form id="checkoutForm" className="panel checkout-form" onSubmit={handleSubmit}>
          <h1 className="page-title">Оформление заказа</h1>

          <div className="form-block">
            <h3>Тип доставки</h3>
            <label className="radio-line">
              <input
                type="radio"
                name="shippingType"
                value="cdek_pvz"
                checked={formData.shippingType === 'cdek_pvz'}
                onChange={(e) =>
                  setFormData({ ...formData, shippingType: e.target.value })
                }
              />
              СДЭК до ПВЗ (600 ₽)
            </label>
            <label className="radio-line">
              <input
                type="radio"
                name="shippingType"
                value="omsk_courier"
                checked={formData.shippingType === 'omsk_courier'}
                onChange={(e) =>
                  setFormData({ ...formData, shippingType: e.target.value })
                }
              />
              Доставка по Омску (0 ₽)
            </label>
          </div>

          <div className="form-grid">
            <label>
              Полное имя
              <input
                name="fullName"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </label>
            <label>
              Телефон
              <input
                name="phone"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </label>
            <label>
              Город доставки
              <input
                name="city"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </label>
            <label className="wide">
              Адрес доставки
              <input
                name="address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </label>
            <label className="wide">
              Комментарий
              <textarea
                name="comment"
                rows={3}
                placeholder="Подъезд, этаж, ориентир"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
              />
            </label>
            <label>
              Промокод
              <input
                name="promoCode"
                placeholder="KABURO10"
                value={formData.promoCode}
                onChange={(e) =>
                  setFormData({ ...formData, promoCode: e.target.value })
                }
              />
            </label>
          </div>

          <div className="form-block">
            <h3>Способ оплаты</h3>
            <label className="radio-line">
              <input
                type="radio"
                name="paymentMethod"
                value="card_ru"
                checked={formData.paymentMethod === 'card_ru'}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              />
              Банковская карта (Россия)
            </label>
          </div>

          <label className="consent-line">
            <input
              type="checkbox"
              name="consent"
              required
              checked={formData.consent}
              onChange={(e) =>
                setFormData({ ...formData, consent: e.target.checked })
              }
            />
            <span>
              Согласен с условиями{' '}
              <a href="/offer" target="_blank" rel="noreferrer">
                публичной оферты
              </a>
              . Согласен на обработку персональных данных, с{' '}
              <a href="/privacy" target="_blank" rel="noreferrer">
                политикой конфиденциальности и обработки персональных данных
              </a>{' '}
              ознакомлен.
            </span>
          </label>

          <button
            className="cta cta-full"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Обработка...' : 'Перейти к оплате'}
          </button>
          {error && <p className="form-status" style={{ color: 'red' }}>{error}</p>}
        </form>

        <aside className="panel summary-panel">
          <h2>Ваш заказ</h2>
          <div id="summaryItems">
            {cartItems.map((item: any) => (
              <div key={`${item.productId}-${item.size}`} className="summary-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <div>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {item.size} × {item.quantity}
                  </div>
                </div>
                <div>{item.price * item.quantity} ₽</div>
              </div>
            ))}
          </div>
          <dl>
            <div>
              <dt>Товары</dt>
              <dd>{subtotal} ₽</dd>
            </div>
            <div>
              <dt>Скидка</dt>
              <dd>{discount} ₽</dd>
            </div>
            <div>
              <dt>Доставка</dt>
              <dd>{shipping} ₽</dd>
            </div>
            <div className="total-row">
              <dt>К оплате</dt>
              <dd>{total} ₽</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  )
}
