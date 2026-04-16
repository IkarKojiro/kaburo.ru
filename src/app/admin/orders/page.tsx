import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function OrdersPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/admin/login')
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return (
    <main className="container" style={{ padding: '3rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Управление заказами</h1>
        <Link href="/admin" className="ghost-btn">← Назад</Link>
      </div>

      <div className="panel">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--line)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>ID</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Дата</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Клиент</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Телефон</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Товары</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Сумма</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => {
              const customer = order.customer as any
              const delivery = order.delivery as any
              const totals = order.totals as any

              return (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {order.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    <div>{customer.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{customer.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    {customer.phone}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    {order.items.length} шт.
                    <details style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                      <summary style={{ cursor: 'pointer' }}>Подробнее</summary>
                      <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                        {order.items.map((item: any) => (
                          <li key={item.id}>
                            {item.name} ({item.size}) × {item.quantity} = {item.lineTotal} ₽
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    {totals.total} ₽
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor:
                          order.status === 'paid'
                            ? '#d4edda'
                            : order.status === 'awaiting_payment'
                            ? '#fff3cd'
                            : order.status === 'cancelled'
                            ? '#f8d7da'
                            : '#e2e3e5',
                        color:
                          order.status === 'paid'
                            ? '#155724'
                            : order.status === 'awaiting_payment'
                            ? '#856404'
                            : order.status === 'cancelled'
                            ? '#721c24'
                            : '#383d41',
                      }}
                    >
                      {order.status === 'paid' && 'Оплачен'}
                      {order.status === 'awaiting_payment' && 'Ожидает оплаты'}
                      {order.status === 'cancelled' && 'Отменен'}
                      {order.status === 'processing' && 'В обработке'}
                      {order.status === 'shipped' && 'Отправлен'}
                      {order.status === 'delivered' && 'Доставлен'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="empty" style={{ textAlign: 'center', padding: '2rem' }}>
            Заказов пока нет
          </p>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
        <p>Всего заказов: {orders.length}</p>
        <p>Оплачено: {orders.filter(o => o.status === 'paid').length}</p>
        <p>Ожидает оплаты: {orders.filter(o => o.status === 'awaiting_payment').length}</p>
      </div>
    </main>
  )
}
