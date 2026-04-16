import { prisma } from '../src/lib/db'

async function main() {
  console.log('Checking collections...')
  const collections = await prisma.collection.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  console.log('\nCollections:')
  collections.forEach(col => {
    console.log(`- ${col.name} (${col.id}): ${col._count.products} products`)
  })

  console.log('\nChecking products...')
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      collectionId: true,
      order: true,
    }
  })

  console.log(`\nTotal products: ${products.length}`)
  products.forEach(prod => {
    console.log(`- ${prod.name} (${prod.id}): collection=${prod.collectionId}, order=${prod.order}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
