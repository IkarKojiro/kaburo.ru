import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <main className="container" style={{ padding: '3rem 0' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>
        Панель управления
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '800px' }}>
        <Link href="/admin/collections" className="panel" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem', transition: 'transform 0.2s' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Управление товарами</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Управление коллекциями и товарами внутри них
          </p>
        </Link>

        <Link href="/admin/orders" className="panel" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem', transition: 'transform 0.2s' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Управление заказами</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Просмотр и обработка заказов
          </p>
        </Link>
      </div>
    </main>
  )
}
