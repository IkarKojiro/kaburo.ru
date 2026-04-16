import { prisma } from '@/lib/db'
import { ProductGrid } from '@/components/product/ProductGrid'

export default async function HomePage() {
  const collections = await prisma.collection.findMany({
    orderBy: { order: 'asc' },
    include: {
      products: {
        orderBy: { order: 'asc' }
      }
    }
  })

  return (
    <main>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <p className="kicker">KABURO / STREETWEAR</p>
          <h1>Сшито для улиц. Собрано для движения.</h1>
          <p className="hero-copy">
            Небесный акцент, жесткий крой и повседневная функциональность. Наши капсулы собираются как
            единый униформенный сет.
          </p>
        </div>
      </section>

      {collections.map((collection) => (
        <section key={collection.id} className="shop" id="catalog">
          <div className="container">
            <div className="section-head">
              <h2>{collection.name}</h2>
              {collection.description && (
                <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
                  {collection.description}
                </p>
              )}
            </div>
            <ProductGrid products={collection.products} />
          </div>
        </section>
      ))}
    </main>
  )
}
