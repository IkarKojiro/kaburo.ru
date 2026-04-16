import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { items } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const cartItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return null

      const stock = (product.stock as any)?.[item.size] || 0

      return {
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        name: product.name,
        price: product.price,
        image: (product.images as any)?.[0] || '',
        stock: stock,
      }
    }).filter(Boolean)

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
