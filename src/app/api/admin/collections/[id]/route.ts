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

    const collection = await prisma.collection.findUnique({
      where: { id }
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error('Failed to fetch collection:', error)
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}

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
    const { name, slug, description, order } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        order: order || 0,
      }
    })

    return NextResponse.json({ collection })
  } catch (error: any) {
    console.error('Failed to update collection:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 })
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

    await prisma.collection.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete collection:', error)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}
