const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating default collection...')

  // Создаем коллекцию DROP #001
  const collection = await prisma.collection.create({
    data: {
      name: 'DROP #001',
      slug: 'drop-001',
      description: 'Первая коллекция KABURO',
      order: 1,
    }
  })

  console.log('Collection created:', collection.id)

  // Привязываем все существующие товары к этой коллекции
  const result = await prisma.product.updateMany({
    where: {
      collectionId: null
    },
    data: {
      collectionId: collection.id
    }
  })

  console.log(`Updated ${result.count} products`)
  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
  })
