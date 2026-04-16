import { prisma } from '../src/lib/db'

async function main() {
  // Получаем первую коллекцию
  const firstCollection = await prisma.collection.findFirst({
    orderBy: { order: 'asc' }
  })

  if (!firstCollection) {
    console.log('No collections found. Create a collection first.')
    return
  }

  console.log(`Found collection: ${firstCollection.name} (${firstCollection.id})`)

  // Получаем все товары без коллекции
  const productsWithoutCollection = await prisma.product.findMany({
    where: { collectionId: null }
  })

  console.log(`\nFound ${productsWithoutCollection.length} products without collection`)

  if (productsWithoutCollection.length === 0) {
    console.log('All products already have a collection assigned.')
    return
  }

  // Привязываем все товары к первой коллекции
  let order = 1
  for (const product of productsWithoutCollection) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        collectionId: firstCollection.id,
        order: order++
      }
    })
    console.log(`✓ Assigned ${product.name} to ${firstCollection.name}`)
  }

  console.log(`\n✅ Successfully assigned ${productsWithoutCollection.length} products to collection "${firstCollection.name}"`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
