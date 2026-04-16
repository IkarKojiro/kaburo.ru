const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'kaburo',
  user: 'postgres',
  password: 'admin'
})

async function main() {
  try {
    console.log('Creating collection...')

    // Создаем коллекцию
    const collectionResult = await pool.query(`
      INSERT INTO collections (id, name, slug, description, "order", created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, ['cm8x1y2z3', 'DROP #001', 'drop-001', 'Первая коллекция KABURO', 1])

    console.log('Collection created:', collectionResult.rows[0]?.id || 'already exists')

    // Привязываем все товары к этой коллекции
    const updateResult = await pool.query(`
      UPDATE products
      SET collection_id = $1
      WHERE collection_id IS NULL
    `, ['cm8x1y2z3'])

    console.log(`Updated ${updateResult.rowCount} products`)
    console.log('Done!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

main()
