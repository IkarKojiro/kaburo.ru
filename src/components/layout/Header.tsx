'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'

export function Header() {
  const [mounted, setMounted] = useState(false)
  const items = useCart((state) => state.items)
  const cartCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="logo">
          <Image src="/logo.svg" alt="KABURO" width={36} height={36} />
          <span>KABURO</span>
        </Link>
        <Link href="/cart" className="cart-link">
          Корзина {cartCount > 0 && <span>{cartCount}</span>}
        </Link>
      </div>
    </header>
  )
}
