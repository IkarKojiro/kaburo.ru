require('dotenv').config({ path: '.env.local' });

const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');

async function migrateData() {
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pgClient.connect();
    console.log('✅ Подключено к PostgreSQL\n');

    // Подключаемся к старой SQLite базе
    const sqlitePath = path.join(__dirname, '..', '..', 'kaburo shop', 'db', 'kaburo.db');
    const sqlite = new Database(sqlitePath, { readonly: true });
    console.log('✅ Подключено к SQLite\n');

    console.log('📦 Начинаем миграцию данных...\n');

    // Миграция товаров
    console.log('1️⃣ Миграция товаров...');
    const products = sqlite.prepare('SELECT * FROM products').all();

    for (const row of products) {
      await pgClient.query(
        `INSERT INTO products (id, name, category, price, description, sizes, stock, colors, images, is_new, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          row.id,
          row.name,
          row.category,
          row.price,
          row.description,
          row.sizes,
          row.stock,
          row.colors,
          row.images,
          Boolean(row.is_new),
        ]
      );
    }
    console.log(`✅ Мигрировано ${products.length} товаров\n`);

    // Миграция заказов
    console.log('2️⃣ Миграция заказов...');
    const orders = sqlite.prepare('SELECT * FROM orders').all();

    for (const orderRow of orders) {
      await pgClient.query(
        `INSERT INTO orders (id, status, created_at, paid_at, failed_at, failure_reason, customer, delivery, payment_method, comment, promo_code, consent_accepted, totals, payment)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          orderRow.id,
          orderRow.status,
          orderRow.created_at,
          orderRow.paid_at,
          orderRow.failed_at,
          orderRow.failure_reason,
          orderRow.customer,
          orderRow.delivery,
          orderRow.payment_method,
          orderRow.comment,
          orderRow.promo_code,
          Boolean(orderRow.consent_accepted),
          orderRow.totals,
          orderRow.payment,
        ]
      );

      const items = sqlite
        .prepare('SELECT * FROM order_items WHERE order_id = ?')
        .all(orderRow.id);

      for (const item of items) {
        await pgClient.query(
          `INSERT INTO order_items (order_id, product_id, name, size, quantity, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            orderRow.id,
            item.product_id,
            item.name,
            item.size,
            item.quantity,
            item.unit_price,
            item.line_total,
          ]
        );
      }
    }
    console.log(`✅ Мигрировано ${orders.length} заказов\n`);

    sqlite.close();
    console.log('🎉 Миграция завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

migrateData();
