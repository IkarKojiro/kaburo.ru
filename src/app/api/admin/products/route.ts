import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, price, description, sizes, stock, colors, images, isNew, collectionId, order } = body

    if (!id || !name || !price) {
      return NextResponse.json({ error: 'ID, name and price are required' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        id,
        name,
        price,
        description,
        sizes,
        stock,
        colors,
        images,
        isNew: isNew || false,
        order: order || 0,
        collectionId: collectionId || null,
      }
    })

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Failed to create product:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Product ID already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
