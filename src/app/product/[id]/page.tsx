import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product/ProductDetail'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product as any} />
}
