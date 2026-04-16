import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
