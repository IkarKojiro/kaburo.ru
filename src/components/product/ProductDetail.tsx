'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { useCart } from '@/hooks/useCart'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [notification, setNotification] = useState(false)
  const addItem = useCart((state) => state.addItem)
  const items = useCart((state) => state.items)

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Пожалуйста, выберите размер')
      return
    }

    const stock = product.stock[selectedSize] || 0
    if (stock <= 0) {
      alert('Этот размер закончился')
      return
    }

    // Проверяем, сколько уже в корзине
    const existingItem = items.find(
      (item) => item.productId === product.id && item.size === selectedSize
    )
    const currentQuantity = existingItem ? existingItem.quantity : 0

    // Максимум 3 штуки на товар
    const maxPerProduct = 3

    if (currentQuantity >= maxPerProduct) {
      alert(`Максимальное количество на один товар: ${maxPerProduct} шт.`)
      return
    }

    if (currentQuantity >= stock) {
      alert(`Максимальное количество для размера ${selectedSize}: ${stock} шт.`)
      return
    }

    addItem({
      productId: product.id,
      size: selectedSize,
      quantity: 1,
    })

    setNotification(true)
    setTimeout(() => setNotification(false), 2000)
  }

  return (
    <main className="product-page">
      <div>
        <div className="product-page__media">
          <Image
            src={product.images[selectedImage]}
            alt={product.name}
            width={560}
            height={700}
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="product-thumbs">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                className={`thumb-btn ${selectedImage === idx ? 'active' : ''}`}
                onClick={() => setSelectedImage(idx)}
              >
                <Image src={img} alt={`${product.name} ${idx + 1}`} width={54} height={68} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-page__info">
        <h1>{product.name}</h1>
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        <p className="product-page__price">{product.price} ₽</p>

        <div className="product-page__controls">
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            required
          >
            <option value="">Размер</option>
            {product.sizes.map((size: any) => {
              const stock = product.stock[size] || 0
              return (
                <option key={size} value={size} disabled={stock <= 0}>
                  {size} {stock <= 0 ? '(нет в наличии)' : ''}
                </option>
              )
            })}
          </select>
          <button className="cta" onClick={handleAddToCart}>
            В корзину
          </button>
        </div>
      </div>

      {notification && (
        <div className="cart-notification show">Товар добавлен в корзину</div>
      )}
    </main>
  )
}
