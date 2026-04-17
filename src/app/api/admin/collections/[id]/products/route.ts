import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const products = await prisma.product.findMany({
      where: { collectionId: id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        images: true,
        sizes: true,
        stock: true,
        colors: true,
        isNew: true,
        order: true,
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
