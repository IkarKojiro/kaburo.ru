import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, price, description, sizes, stock, colors, images, isNew, collectionId, order } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        description,
        sizes,
        stock,
        colors,
        images,
        isNew: isNew || false,
        order: order !== undefined ? order : 0,
        collectionId: collectionId || null,
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
