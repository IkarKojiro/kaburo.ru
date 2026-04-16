import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const collections = await prisma.collection.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json({ collections })
  } catch (error) {
    console.error('Failed to fetch collections:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, description, order } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description: description || null,
        order: order || 0,
      }
    })

    return NextResponse.json({ collection })
  } catch (error: any) {
    console.error('Failed to create collection:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}
